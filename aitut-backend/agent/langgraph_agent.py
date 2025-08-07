import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs
from typing import Annotated, Sequence, TypedDict
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from googleapiclient.discovery import build
from isodate import parse_duration
from langchain_openai import ChatOpenAI

load_dotenv()

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")  # Ensure this is set in .env

# ✅ Unified model for both agent + tools
openai_model = ChatOpenAI(
    model="gpt-4o",
    temperature=0.0,
    max_tokens=750
)

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

### Summary Tool
@tool
def get_ai_summary(message: str) -> str:
    """Generates a detailed summary for a string input."""
    try:
        response = openai_model.invoke([
            SystemMessage(content="Generate a detailed summary. Follow formatting rules."),
            HumanMessage(content=message)
        ])
        return response.content.strip()
    except Exception as e:
        print("Summary error:", str(e))
        return "Summary failed."

### Quiz Tool
@tool
def generate_quiz(text: str) -> str:
    """Generate 5 multiple choice questions (MCQs) with answers based on the input text."""
    try:
        response = openai_model.invoke([
            SystemMessage(content="Generate 5 MCQs with 4 options and add -> sign before correct answer. Give options for those questions as well."),
            HumanMessage(content=text)
        ])
        return response.content.strip()
    except Exception as e:
        print("Quiz error:", str(e))
        return "Quiz failed."

### Translation Tool
@tool
def get_translation(transcript: str) -> str:
    """Translate the given transcript to English."""
    try:
        response = openai_model.invoke([
            SystemMessage(content="Translate this transcript to English."),
            HumanMessage(content=transcript)
        ])
        return response.content.strip()
    except Exception as e:
        print("Translation error:", str(e))
        return "Translation failed."

### Transcript Tool
@tool
def get_ai_transcript(url: str) -> str:
    """Fetch the transcript of a YouTube video and return it."""
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    video_id = query_params.get("v", [None])[0]
    final_transcript = ""

    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        sorted_transcripts = sorted(transcript, key=lambda x: x['start'])
        chunk_duration = 1500
        max_start = sorted_transcripts[-1]['start']

        for start in range(0, int(max_start) + 1, chunk_duration):
            chunk = [t['text'] for t in sorted_transcripts if start <= t['start'] < start + chunk_duration]
            chunk_text = " ".join(chunk)
            if chunk_text.strip():
                final_transcript += chunk_text + "\n\n"

        return final_transcript.strip()

    except Exception as e:
        print("Transcript Error:", e)
        return "Transcript not available."

### YouTube Video Search Tool
@tool
def search_youtube_videos(query: str, max_results: int = 300) -> list:
    """Fetch top YouTube videos (longer than 5 minutes) for a query. Skips unavailable/private videos."""
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

    search_response = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results
    ).execute()

    video_ids = [item["id"]["videoId"] for item in search_response["items"]]

    if not video_ids:
        return []

    details_response = youtube.videos().list(
        part="contentDetails,snippet,status",
        id=",".join(video_ids)
    ).execute()

    def format_duration(seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"

    videos = []
    for item in details_response.get("items", []):
        status = item.get("status", {})
        privacy_status = status.get("privacyStatus", "")
        embeddable = status.get("embeddable", True)

        if privacy_status != "public" or not embeddable:
            continue

        try:
            duration_iso = item["contentDetails"]["duration"]
            duration_sec = parse_duration(duration_iso).total_seconds()
        except:
            continue

        if duration_sec < 400:
            continue

        videos.append({
            "vid_title": item["snippet"]["title"],
            "vid_id": item["id"],
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            "vid_url": f"https://www.youtube.com/watch?v={item['id']}"
        })

    return videos

### Tool Bind
tools = [get_ai_transcript, search_youtube_videos, get_translation, generate_quiz]
model = openai_model.bind_tools(tools)

### LangGraph Agent Logic
def model_call(state: AgentState) -> AgentState:
    prompt_text = """
Persona

You are a helpful and knowledgeable AI Tutor. Your primary goal is to assist users by providing accurate and relevant information, educational content, and interactive learning experiences.

Core Instructions
USE THE get_ai_transcript TOOL TO SUMMARISE OR FETCH TRANSCRIPTS OF THE YOUTUBE VIDEO SENT THROUGH LINK.DO THIS ONLY IF USER HAS ASKED TO SUMMARISE A YOUTUBE VIDEO OR TO FETCH THE TRANSCRIPT OF THE VIDEO.IS USER ASKS FOR TRANSCRIPTS THEN RETURN RAW TRANSCRIPTS AS RETURNED BY THE TOOL.IF USER ASKS SUMMARY THEN SUMMARISE THAT TRANSCRIPT FOR HIM.IF YOU ARE UNABLE TO FETCH TRANSCRIPT OF THAT VIDEO THEN TELL THE USER THAT U WERE UNABLE TO FETCH THE TRANSCRIPT FOR THAT VIDEO.
Prioritize User Intent: Always focus on understanding and fulfilling the user's most recent request. Use the provided conversation history for context.

Be Tool-Driven: Rely on the available tools to generate your responses.

Follow Formatting Rules: Adhere strictly to the specified output formats for quizzes and YouTube video searches. Do not add any extra text, explanations, or apologies.

No "Assistant:" Prefix: Do not begin your responses with "Assistant:".

Task-Specific Guidelines

1. Generating Quizzes

If the user requests a quiz, you MUST follow these rules precisely:

Prefix: Your entire response MUST start with the exact prefix: QUIZ_$#%^&$24534

JSON Output: The prefix must be immediately followed by a single, valid JSON array string [...].

Question Objects: The JSON array must contain a series of question objects {}. Each object MUST contain the following three keys:

"question": A string with the full question text.

"options": A JSON array of strings representing the possible answer choices.

"answer": A string that is an EXACT match to the correct option from the "options" array.

Example:

QUIZ_$#%^&$24534[{"question":"What is the capital of France?","options":["London","Berlin","Paris","Madrid"],"answer":"Paris"}]

2. Fetching YouTube Videos

If the user asks for YouTube videos, follow this process:

Clarify the User's Need:

Do not immediately return a generic list of videos.

First, ask clarifying questions to understand the user's specific needs. For example, ask about their current knowledge level (beginner, intermediate, advanced) or the specific subtopics they are interested in.

Formulate an Effective Query:

Based on the user's refined request, create a targeted and effective search query to use with the search_youtube_videos tool.

Format the Output:

Prefix: Your entire response MUST start with the exact prefix: YTSEARCH_$#%^&$24534

JSON Output: The prefix must be immediately followed by a single JSON array of video result objects [...].

Video Object Keys: Each object in the array MUST use these exact keys and map them from the tool's output:

"vid_title": From the tool's "title".

"vid_id": From the tool's "videoId".

"thumbnail": From the tool's "thumbnail".

"vid_url": From the tool's "videoUrl".

Number of Results: Provide the number of results requested by the user. If no number is specified, provide the top 3 results.

No Results: If the tool returns no videos, your response should be: There was a problem fetching videos.

Example:

YTSEARCH_$#%^&$24534[{"vid_title":"Perfect Pasta in 10 Mins","vid_id":"a1b2c3d4e5f","thumbnail":"https://...","vid_url":"https://www.youtube.com/watch?v=a1b2c3d4e5f"}]

3. Summaries and Transcripts

Summary Request: If the user asks for a summary, provide only the summary.

Transcript Request: If the user asks for a transcript, provide only the transcript.
"""
    system_prompt = SystemMessage(content=prompt_text)
    response = model.invoke([system_prompt] + state["messages"])
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_msg = state["messages"][-1]
    return "continue" if last_msg.tool_calls else "end"

graph = StateGraph(AgentState)
graph.add_node("our_agent", model_call)
graph.add_node("tools", ToolNode(tools=tools))
graph.set_entry_point("our_agent")
graph.add_conditional_edges("our_agent", should_continue, {"continue": "tools", "end": END})
graph.add_edge("tools", "our_agent")

app = graph.compile()

def invoke_agent(input: str) -> str:
    messages = [HumanMessage(content=input)]
    result = app.invoke({"messages": messages})
    return result["messages"][-1].content

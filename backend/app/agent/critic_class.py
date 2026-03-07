from pydantic import BaseModel, Field
from typing import List, Optional

class PaperScore(BaseModel):
    doi: str = Field(description="The DOI of the paper being evaluated.")
    score: int = Field(description="Relevance score from 0 to 100 on how well this paper answers the user query.")
    critic_reasoning: str = Field(description="A brief 1-2 sentence rationale for why this score was given.")

class CriticResponse(BaseModel):
    scored_papers: List[PaperScore] = Field(description="List of papers with their relevance scores.")

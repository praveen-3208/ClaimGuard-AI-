TRACK_ID=PS6

# Transaction Risk Investigation Assistant

## What the Project Does

This project is an AI-powered Transaction Risk Investigation Assistant for a bank's fraud investigation desk.

It analyzes a customer's transaction history against a small set of risk rules and identifies activity that may need closer investigation.

The system does not state that fraud has occurred. It flags and explains potentially risky activity, cites the transactions involved, and leaves the final judgement to a human investigator.

## Features

- Analyze customer transaction history
- Detect unusually large transfers
- Detect bursts of payments to a newly added payee
- Detect odd-hours activity
- Compare activity with the customer's established pattern
- Show the transactions supporting each finding
- Explain which risk rule was triggered
- Recommend what an investigator should look at first
- Escalate uncertain or unsupported cases to a human investigator
- Avoid making unsupported fraud decisions

## Technology Stack

- Backend: Python
- AI: Google Gemini API
- Frontend: [Add your frontend technology]
- Data / storage: [Add the libraries or database actually used]

## How to Run

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set the Gemini API key

The application reads the key from the `GEMINI_API_KEY` environment variable.

#### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

#### Linux / macOS

```bash
export GEMINI_API_KEY="YOUR_API_KEY"
```

Do not commit the API key to GitHub.

### 3. Start the application

```bash
python app.py
```

Open:

```text
http://localhost:8000
```

## Data and Documents

The project uses self-created transaction data and risk rules for the problem statement.

The transaction history contains fields such as:

- Date
- Description
- Payee
- Amount
- Channel

The system evaluates the transaction history against the defined risk rules.

## AI and Grounding

Gemini is used for the AI reasoning component.

The application combines deterministic risk-rule checks with AI reasoning. Findings are tied to the underlying transaction history so that the system can show the evidence behind its recommendations.

When the available information does not support a conclusion, the system should say so or escalate the case instead of guessing.

## Human Review

The system is an investigation assistant, not a final fraud decision-maker.

Potentially risky activity is flagged for investigation, and uncertain cases are escalated to a human investigator.

## Demo Video

Demo Video: [PASTE YOUR DEMO VIDEO LINK HERE]

## GitHub Repository

Repository: [PASTE YOUR GITHUB REPOSITORY LINK HERE]

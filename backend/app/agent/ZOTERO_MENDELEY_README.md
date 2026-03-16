# Zotero & Mendeley Sync Agent

## Overview

The Zotero & Mendeley Sync Agent enables pushing research papers and bibliographic data to both Zotero and Mendeley reference management platforms. This agent supports both single paper sync and batch operations.

## Features

- **Single Paper Sync**: Push individual papers to Zotero and/or Mendeley
- **Batch Sync**: Sync multiple papers in a single request
- **Flexible Platform Selection**: Choose which platforms to sync to
- **Tag Support**: Add custom tags/keywords to papers
- **Error Handling**: Comprehensive error reporting for failed syncs

## API Endpoints

### 1. Single Paper Sync

**Endpoint**: `POST /research/sync/zotero-mendeley`

**Description**: Sync a single paper to Zotero and/or Mendeley

**Request Body**:

```json
{
  "doi": "10.1234/example.doi",
  "title": "Example Research Paper Title",
  "author": "John Doe, Jane Smith",
  "abstract": "Paper abstract text here...",
  "year": 2024,
  "platforms": ["zotero", "mendeley"],
  "tags": ["machine-learning", "research"],
  "zotero_api_token": "YOUR_ZOTERO_API_TOKEN",
  "user_zotero_id": "YOUR_ZOTERO_USER_ID",
  "mendeley_credentials": {
    "access_token": "YOUR_MENDELEY_ACCESS_TOKEN"
  }
}
```

**Response**:

```json
{
  "doi": "10.1234/example.doi",
  "title": "Example Research Paper Title",
  "zotero_response": {
    "success": true,
    "zotero_id": "ABC123",
    "message": "Successfully pushed to Zotero with key ABC123",
    "error": null
  },
  "mendeley_response": {
    "success": true,
    "mendeley_id": "XYZ789",
    "message": "Successfully pushed to Mendeley with ID XYZ789",
    "error": null
  },
  "overall_success": true
}
```

### 2. Batch Sync

**Endpoint**: `POST /research/sync/batch`

**Description**: Sync multiple papers to Zotero and/or Mendeley

**Request Body**:

```json
{
  "papers": [
    {
      "doi": "10.1234/paper1.doi",
      "title": "Paper 1 Title",
      "author": "Author 1",
      "abstract": "Abstract 1",
      "year": 2024,
      "tags": ["tag1", "tag2"],
      "zotero_api_token": "TOKEN",
      "user_zotero_id": "USER_ID",
      "mendeley_credentials": {
        "access_token": "TOKEN"
      }
    },
    {
      "doi": "10.1234/paper2.doi",
      "title": "Paper 2 Title",
      "author": "Author 2",
      "abstract": "Abstract 2",
      "year": 2023,
      "tags": ["tag3"],
      "zotero_api_token": "TOKEN",
      "user_zotero_id": "USER_ID",
      "mendeley_credentials": {
        "access_token": "TOKEN"
      }
    }
  ],
  "platforms": ["zotero", "mendeley"]
}
```

**Response**:

```json
{
  "total_papers": 2,
  "successful_syncs": 2,
  "failed_syncs": 0,
  "results": [
    {
      "doi": "10.1234/paper1.doi",
      "title": "Paper 1 Title",
      "zotero_response": {
        "success": true,
        "zotero_id": "ABC123",
        "message": "Successfully pushed to Zotero with key ABC123",
        "error": null
      },
      "mendeley_response": {
        "success": true,
        "mendeley_id": "XYZ789",
        "message": "Successfully pushed to Mendeley with ID XYZ789",
        "error": null
      },
      "overall_success": true
    },
    {
      "doi": "10.1234/paper2.doi",
      "title": "Paper 2 Title",
      "zotero_response": {...},
      "mendeley_response": {...},
      "overall_success": true
    }
  ]
}
```

## Authentication & Credentials

### Zotero Setup

1. Create a Zotero account at https://www.zotero.org/
2. Generate an API token:
   - Go to Settings → Feeds/API
   - Click "Create new private key"
   - Copy your API key
3. Get your Zotero User ID:
   - Go to Settings → Account
   - Your user ID is displayed in the URL: `https://www.zotero.org/users/{user_id}`

### Mendeley Setup

1. Create a Mendeley account at https://www.elsevier.com/products/mendeley
2. Register your application:
   - Go to https://developers.elsevier.com/
   - Create a new application
   - Get your Client ID and Client Secret
3. Implement OAuth2 flow to get an access token (follow Mendeley API documentation)

## Implementation Details

### Files Created

1. **zotero_mendeley_class.py**: Contains Pydantic schemas for request/response models
2. **zotero_mendeley_agent.py**: Contains the LangGraph agent implementation
3. **router.py**: Updated with new endpoints

### Agent Architecture

The sync agent uses LangGraph to orchestrate:

- Data validation from input
- Parallel sync attempts to both platforms
- Error tracking and reporting
- Response formatting

### Key Functions

- `push_to_zotero()`: Handles Zotero API calls
- `push_to_mendeley()`: Handles Mendeley API calls
- `sync_to_platforms()`: LangGraph node that orchestrates both syncs
- `create_sync_agent()`: Creates the compiled agent graph

## Error Handling

The agent provides detailed error messages for:

- Missing credentials
- API failures
- Network timeouts
- Invalid paper metadata

## Usage Examples

### Python Client Example

```python
import requests

# Single paper sync
sync_request = {
    "doi": "10.1234/example.doi",
    "title": "Example Paper",
    "author": "John Doe",
    "year": 2024,
    "platforms": ["zotero", "mendeley"],
    "zotero_api_token": "YOUR_TOKEN",
    "user_zotero_id": "YOUR_ID",
    "mendeley_credentials": {
        "access_token": "YOUR_MENDELEY_TOKEN"
    }
}

response = requests.post(
    "http://localhost:8000/research/sync/zotero-mendeley",
    json=sync_request
)

print(response.json())
```

### JavaScript/Fetch Example

```javascript
const syncRequest = {
  doi: "10.1234/example.doi",
  title: "Example Paper",
  author: "John Doe",
  year: 2024,
  platforms: ["zotero", "mendeley"],
  zotero_api_token: "YOUR_TOKEN",
  user_zotero_id: "YOUR_ID",
  mendeley_credentials: {
    access_token: "YOUR_MENDELEY_TOKEN",
  },
};

fetch("http://localhost:8000/research/sync/zotero-mendeley", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(syncRequest),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

## Future Enhancements

- [ ] Integration with Supabase for credential storage
- [ ] Automatic retry logic with exponential backoff
- [ ] Support for syncing from Zotero/Mendeley collections to the app
- [ ] Webhook support for automated syncing
- [ ] Advanced metadata parsing and enrichment
- [ ] Support for other reference managers (EndNote, RefWorks, etc.)

## Security Considerations

⚠️ **Important**: Never hardcode API tokens or credentials in your code. Consider:

1. Store credentials in environment variables
2. Use Supabase secure storage for user credentials
3. Implement OAuth2 flows for better security
4. Use HTTPS in production
5. Implement rate limiting to prevent abuse
6. Add authentication checks to API endpoints (using `get_current_user`)

## Troubleshooting

### Zotero Sync Fails

- Verify API token is correct and not expired
- Check User ID matches your Zotero account
- Ensure DOI format is correct (with or without https://doi.org/)

### Mendeley Sync Fails

- Verify access token is valid and not expired
- Check OAuth2 token refresh if token has expired
- Ensure required scopes are granted

### Batch Sync Hangs

- Check network connectivity
- Increase timeout in requests (currently 10 seconds per platform)
- Monitor API rate limits for both services

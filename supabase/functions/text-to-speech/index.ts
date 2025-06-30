import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const voiceIds = {
  James: 'EkK5I93UQWFDigLMpZcX',
  Cassidy: '56AoDkrOh6qfVPDXZ7Pt',
  Drew: 'wgHvco1wiREKN0BdyVx5',
  Lavender: 'QwvsCFsQcnpWxmP1z7V9'
};

// Rate limiting store for TTS
const ttsRateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkTTSRateLimit(userId: string, maxRequests: number = 5): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const key = `tts_${userId}`
  
  const current = ttsRateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    ttsRateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Efficient base64 encoding for large files
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000 // 32KB chunks
  let result = ''
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize)
    result += String.fromCharCode(...chunk)
  }
  
  return btoa(result)
}

// Upload audio to GitHub as a public gist using the base64 string
async function uploadAudioToGitHub(base64Audio: string): Promise<string> {
  const githubToken = Deno.env.get('GITHUB_GIST_TOKEN')
  
  if (!githubToken) {
    console.warn('GitHub token not found, skipping gist upload')
    throw new Error('GitHub token not configured')
  }

  try {
    console.log('Uploading audio to GitHub using provided base64 string...')
    
    // Create a unique filename
    const timestamp = Date.now()
    const fileName = `tts_audio_${timestamp}.mp3`
    
    // Create a GitHub gist with the audio file
    const gistData = {
      description: `TTS Audio - ${new Date().toISOString()}`,
      public: true,
      files: {
        [fileName]: {
          content: base64Audio
        },
        "README.md": {
          content: `# TTS Audio File\n\nGenerated on: ${new Date().toISOString()}\n\nThis is a temporary audio file for text-to-speech functionality.`
        }
      }
    }

    // Use GitHub API to create gist with authentication
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'TTS-Audio-Service'
      },
      body: JSON.stringify(gistData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`GitHub API error: ${response.status}`, errorText)
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const gist = await response.json()
    
    // Get the raw URL for the audio file
    const rawUrl = gist.files[fileName].raw_url
    
    console.log('Audio uploaded to GitHub successfully:', rawUrl)
    return rawUrl
    
  } catch (error) {
    console.error('Error uploading to GitHub:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'Drew', userId } = await req.json()
    
    console.log(`TTS request received - Voice: ${voice}, Text length: ${text?.length || 0}, User: ${userId}`)
    
    // Rate limiting check
    if (userId && !checkTTSRateLimit(userId, 5)) {
      console.log(`TTS rate limit exceeded for user: ${userId}`)
      return new Response(
        JSON.stringify({ error: 'Too many TTS requests. Please try again later.' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!text) {
      console.error('No text provided for TTS')
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate text length for TTS
    if (text.length > 2000) {
      console.error(`Text too long for TTS: ${text.length} characters`)
      return new Response(
        JSON.stringify({ error: 'Text too long for TTS conversion' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key not found in environment')
      return new Response(
        JSON.stringify({ error: 'TTS service not configured - missing API key' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const voiceId = voiceIds[voice as keyof typeof voiceIds] || voiceIds.Drew

    console.log(`Generating TTS with ElevenLabs - Voice: ${voice} (${voiceId})`)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    })

    console.log(`ElevenLabs API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      
      // Parse error for more specific messages
      let errorMessage = 'TTS service temporarily unavailable'
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.detail && errorJson.detail.message) {
          errorMessage = errorJson.detail.message
        }
      } catch (e) {
        // Keep default error message
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    console.log(`Audio generated successfully - Size: ${audioBuffer.byteLength} bytes`)
    
    // Use the efficient base64 encoding function
    const audioBase64 = arrayBufferToBase64(audioBuffer)

    // Try to upload to GitHub for public access (for video generation)
    let publicUrl: string | null = null
    try {
      publicUrl = await uploadAudioToGitHub(audioBase64)
      console.log('GitHub upload successful, public URL available for video generation')
    } catch (error) {
      console.warn('GitHub upload failed, video generation will not be available:', error.message)
      // Don't fail the entire request - audio can still be played locally
    }

    return new Response(
      JSON.stringify({ 
        audio: audioBase64,
        publicUrl: publicUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    return new Response(
      JSON.stringify({ error: `TTS service error: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
export async function sendWhatsAppText(
  number: string,
  message: string
) {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number,
        type: 'text',
        message,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp text:', error);
    throw error;
  }
}

export async function sendWhatsAppImage(
  number: string,
  mediaUrl: string,
  message: string
) {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number,
        type: 'image',
        media_url: mediaUrl,
        message,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp image:', error);
    throw error;
  }
}

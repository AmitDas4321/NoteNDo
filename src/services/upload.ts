export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    // tmpfiles.org returns a URL like https://tmpfiles.org/12345/filename
    // To get the direct link, we need to insert /dl/ after the domain
    const url = result.data.url;
    const directUrl = url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
    return directUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

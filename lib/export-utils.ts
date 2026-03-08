/**
 * Utility for exporting schedule as image.
 * Isolated from components to prevent HMR and server-side instantiation issues.
 */

export async function exportToPng(element: HTMLElement, filename: string) {
  if (typeof window === 'undefined') return;
  
  try {
    // Dynamic import to ensure it only loads on the client
    const { toPng } = await import('html-to-image');
    
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      style: {
        overflow: 'visible',
        height: 'auto',
        width: 'fit-content'
      }
    });
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Export to PNG failed:', err);
    throw err;
  }
}

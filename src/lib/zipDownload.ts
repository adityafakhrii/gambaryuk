import JSZip from 'jszip';

export async function downloadAsZip(
  files: { name: string; blob: Blob }[],
  zipName: string = 'images.zip'
) {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}

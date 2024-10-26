export const renderFormattedText = (text: string) => {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/__(.*?)__/g, '<u class="underline">$1</u>');

  return { __html: formattedText };
};

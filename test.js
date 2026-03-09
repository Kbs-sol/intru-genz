const body = `
    txt = txt.replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>');
    txt = txt.replace(/([_\\*])(.*?)\\1/g, '<i>$2</i>');
`;
console.log(body);

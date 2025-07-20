export default class Extract {
  static getExtractLogic(key: string, action: string) {
    switch (key) {
      case "jbsou":
        return `
            const song = {
                siteKey:"jbsou",
                title:document.querySelector('#j-name').value,
                author:document.querySelector('#j-author').value,
                url:window.location.href,
                src:document.querySelector('#j-src').value
              }
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action:'${action}',
                data:song
              }));
        `;
      case "22a5":
        return `
            const extractLogic = ()=>{
              try{
                const song = {
                  url:window.location.href,
                  siteKey:"22a5",
                  title: (() => {
                    const raw = document.querySelector('.djname').innerText.replace('刷新','');
                    const match = raw.match(/《([^》]+)》/);
                    return match ? match[1] : raw;
                  })(),
                  author:document.querySelector('.play_singer .name').innerText,
                  src:"",
                };
                const playerRefs = Object.keys($("#player")[0]);
                playerRefs.forEach((item)=>{
                  if($("#player")[0][item].jPlayer){
                    song.src = $("#player")[0][item].jPlayer.status.src;
                  }
                })
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  action:'${action}',
                  data:song
                }));
              }catch(err){
                // console.log(err);
                alert('当前页面无法提取歌曲');
              }
            }
        `;
    }
  }
}

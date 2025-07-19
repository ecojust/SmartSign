export default class Music {
  static sites: Array<any> = [
    // {
    //   name: "煎饼搜",
    //   key: "jbsou",
    //   steps: ["searchList"],
    // },
    {
      name: "爱玩",
      key: "22a5",
      steps: ["searchList"],
    },

    // {
    //   name: "九酷",
    //   key: "9ku",
    //   steps: ["searchList"],
    // },

    // {
    //   name: "HiFiNi",
    //   key: "hifini",
    //   steps: ["searchList", "searchResource"],
    // },
  ];

  static commonPanel() {
    return `
            const notify = document.createElement('div');
            notify.innerHTML = '脚本已加载...';
            notify.style.cssText = "display:flex;align-items:center;justify-content:space-between;position:fixed;top:0;left:0;width:100vw;height:48px;background:rgba(34,34,34,0.96);z-index:9999;padding:0 16px;box-sizing:border-box;border-bottom-left-radius:12px;border-bottom-right-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);color:#fff;font-size:16px;font-weight:500;";
            document.body.appendChild(notify);

            const extractButton = document.createElement('button');
            extractButton.innerHTML = '提取列表';
            extractButton.style.cssText = 'margin-left: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; transition: transform 0.1s, background 0.1s;';

            const extractButton2 = document.createElement('button');
            extractButton2.innerHTML = '提取歌曲地址';
            extractButton2.style.cssText = 'margin-left: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; transition: transform 0.1s, background 0.1s;';


            // 按下动效
            extractButton.addEventListener('touchstart', function() {
              extractButton.style.transform = 'scale(0.95)';
              extractButton.style.background = '#0056b3';
            });
            extractButton.addEventListener('touchend', function() {
              extractButton.style.transform = 'scale(1)';
              extractButton.style.background = '#007bff';
            });
            extractButton.addEventListener('touchcancel', function() {
              extractButton.style.transform = 'scale(1)';
              extractButton.style.background = '#007bff';
            });

            extractButton2.addEventListener('touchstart', function() {
              extractButton2.style.transform = 'scale(0.95)';
              extractButton2.style.background = '#0056b3';
            });
            extractButton2.addEventListener('touchend', function() {
              extractButton2.style.transform = 'scale(1)';
              extractButton2.style.background = '#007bff';
            });
            extractButton2.addEventListener('touchcancel', function() {
              extractButton2.style.transform = 'scale(1)';
              extractButton2.style.background = '#007bff';
            });

            notify.appendChild(extractButton2);

    `;
  }

  static getSearchUrl(key: string, query: string) {
    switch (key) {
      case "hifini":
        return `https://hifini.net/search-${query}-1-0.htm`;
      case "jbsou":
        return `https://www.jbsou.cn/?name=${query}&type=netease`;
      case "9ku":
        return `https://www.9ku.com/`;
      case "22a5":
        return `https://www.22a5.com/so/${query}.html`;
      default:
        return "";
    }
  }

  static getSearchListScript(key: string, url?: string) {
    switch (key) {
      case "hifini":
        return `
        setTimeout(()=>{
          ${this.commonPanel()}

           extractButton2.addEventListener('click', () => {
            
            });
        },0)
        true;
        `;

      case "22a5":
        return `
        setTimeout(()=>{
          ${this.commonPanel()}
           extractButton2.addEventListener('click', () => {

            try{
              const song = {
                url:window.location.href,
                title: (() => {
                  const raw = document.querySelector('.djname').innerText.replace('刷新','');
                  const match = raw.match(/《([^》]+)》/);
                  return match ? match[1] : raw;
                })(),
                author:document.querySelector('.play_singer .name').innerText,
                src:"",
                duration:document.querySelector('.jp-duration').innerText
              };
              const playerRefs = Object.keys($("#player")[0]);
              playerRefs.forEach((item)=>{
                if($("#player")[0][item].jPlayer){
                  song.src = $("#player")[0][item].jPlayer.status.src;
                }
              })
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action:'songResource',
                data:song
              }));
            }catch(err){
              // console.log(err);
              alert('当前页面无法提取歌曲');
            }





            });
        },0)
        true;
        `;

      case "jbsou":
        return `
        setTimeout(()=>{
            ${this.commonPanel()}

            const style = document.createElement('style');
            style.innerHTML = ".am-topbar ,header, .google-auto-placed,hr, #myhkplayer,.music-tips { display: none !important; }";
            document.head.appendChild(style);

            // extractButton.addEventListener('click', () => {
            //     const lis = document.querySelectorAll('.aplayer-list li');
            //     const res = [];
            //     lis.forEach((item,index)=>{
            //         res.push({
            //           title:item.querySelector('.aplayer-list-title').innerText,
            //           author:item.querySelector('.aplayer-list-author').innerText,
            //           clickIndex:index,
            //           url:"${url}"
            //         })
            //     });
            //     window.ReactNativeWebView.postMessage(JSON.stringify({
            //     }));
            // });

            extractButton2.addEventListener('click', () => {
              const song = {
                title:document.querySelector('#j-name').value,
                author:document.querySelector('#j-author').value,
                url:window.location.href,
                src:document.querySelector('#j-src').value
              }
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action:'songResource',
                data:song
              }));
            });
        },0)
        true;
        `;

      default:
        return "";
    }
  }

  static getSearchResourceScript(key: string, item: any) {
    switch (key) {
      case "hifini":
        return `
        
        
        `;

      case "jbsou":
        return `
        setTimeout(()=>{

          const style = document.createElement('style');
                style.innerHTML = ".am-topbar , .google-auto-placed, .am-text-center, #j-back,hr, #myhkplayer,.music-tips { display: none !important; }";
                document.head.appendChild(style);


            const notify = document.createElement('div');
            notify.innerHTML = '脚本已加载...';
            notify.style.cssText = "display:flex;align-items:center;justify-content:space-between;position:fixed;top:0;left:0;width:100vw;height:48px;background:rgba(34,34,34,0.96);z-index:9999;padding:0 16px;box-sizing:border-box;border-bottom-left-radius:12px;border-bottom-right-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);color:#fff;font-size:16px;font-weight:500;";
            document.body.appendChild(notify);

            const extractButton = document.createElement('button');
            extractButton.innerHTML = '提取歌曲地址';
            extractButton.style.cssText = 'margin-left: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; transition: transform 0.1s, background 0.1s;';

            // 按下动效
            extractButton.addEventListener('touchstart', function() {
              extractButton.style.transform = 'scale(0.95)';
              extractButton.style.background = '#0056b3';
            });
            extractButton.addEventListener('touchend', function() {
              extractButton.style.transform = 'scale(1)';
              extractButton.style.background = '#007bff';
            });
            extractButton.addEventListener('touchcancel', function() {
              extractButton.style.transform = 'scale(1)';
              extractButton.style.background = '#007bff';
            });
            notify.appendChild(extractButton);

            extractButton.addEventListener('click', () => {
                const lis = document.querySelectorAll('.aplayer-list li');
                const clickItem = lis[${item.clickIndex}];
                clickItem.click();
                setTimeout(()=>{
                  const playSrc = document.querySelector('#j-src').value;
                  window.ReactNativeWebView.postMessage(playSrc);
                },500)
            });
        },0)
        true;
        `;

      default:
        return "";
    }
  }
}

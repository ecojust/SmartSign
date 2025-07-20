import Extract from "./extract";

export default class Music {
  static sites: Array<any> = [
    {
      name: "爱玩",
      key: "22a5",
      steps: ["searchList"],
    },
    {
      name: "煎饼搜",
      key: "jbsou",
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

  static commonPanel(getSourceText: string = "提取歌曲地址") {
    return `
            const notify = document.createElement('div');
            notify.innerHTML = '脚本已加载...';
            notify.style.cssText = "display:flex;align-items:center;justify-content:space-between;position:fixed;top:0;left:0;width:100vw;height:48px;background:rgba(34,34,34,0.96);z-index:9999;padding:0 16px;box-sizing:border-box;border-bottom-left-radius:12px;border-bottom-right-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);color:#fff;font-size:16px;font-weight:500;";
            document.body.appendChild(notify);

            const extractButton = document.createElement('button');
            extractButton.innerHTML = '${getSourceText}';
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


            //样式隐藏
            const style = document.createElement('style');
            style.innerHTML = ".am-topbar ,header, .google-auto-placed,hr, #myhkplayer,.music-tips { display: none !important; }";
            document.head.appendChild(style);

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

  static getRefreshScript(
    key: string,
    options: { auto: boolean; delay: number }
  ) {
    return `
        setTimeout(()=>{
          ${this.commonPanel()}
          ${Extract.getExtractLogic(key, "refreshResource")}
          extractButton.addEventListener('click', () => {
              extractLogic();
          });
          if(${options.auto}){
            setTimeout(()=>{
              extractLogic();
            },${options.delay})
          }
        },0)
        true;
      `;
  }

  static getSearchScript(key: string) {
    return `
        setTimeout(()=>{
          ${this.commonPanel()}
          ${Extract.getExtractLogic(key, "songResource")}
          extractButton.addEventListener('click', () => {
              extractLogic();
          });
        },0)
        true;
      `;
  }
}

export default class Music {
  static sites: Array<any> = [
    {
      name: "煎饼搜",
      key: "jbsou",
      steps: ["searchList"],
    },
    {
      name: "HiFiNi",
      key: "hifini",
      steps: ["searchList", "searchResource"],
    },
  ];

  static getSearchListUrl(key: string, query: string) {
    switch (key) {
      case "hifini":
        return `https://hifini.net/search-${query}-1-0.htm`;
      case "jbsou":
        return `https://www.jbsou.cn/?name=${query}&type=netease`;
      default:
        return "";
    }
  }

  static getSearchListScript(key: string, url?: string) {
    switch (key) {
      case "hifini":
        return `
        setTimeout(()=>{
            const res = document.querySelector('body').innerHTML;
            window.ReactNativeWebView.postMessage(res);
        },3000)
        true;
        `;
      case "jbsou":
        return `
        setTimeout(()=>{
            const lis = document.querySelectorAll('.aplayer-list li');

            document.querySelector('.am-topbar')?.remove();
            document.querySelector('.google-auto-placed')?.remove();
            document.querySelector('.am-padding-vertical')?.remove();
            document.querySelector('.am-text-center')?.remove();
            document.querySelector('#j-back')?.remove();
            document.querySelector('#myhkplayer')?.remove();
            const res = [];
            lis.forEach((item,index)=>{
                res.push({
                  title:item.querySelector('.aplayer-list-title').innerText,
                  author:item.querySelector('.aplayer-list-author').innerText,
                  clickIndex:index,
                  url:"${url}"
                })
            });
            window.ReactNativeWebView.postMessage(JSON.stringify(res));

          
        },8000)
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
            document.querySelector('.am-topbar')?.remove();
            document.querySelector('.google-auto-placed')?.remove();
            document.querySelector('.am-padding-vertical')?.remove();
            document.querySelector('.am-text-center')?.remove();
            document.querySelector('#j-back')?.remove();
            document.querySelector('#myhkplayer')?.remove();

            const lis = document.querySelectorAll('.aplayer-list li');
            const clickItem = lis[${item.clickIndex}];
            clickItem.click();
            setTimeout(()=>{
              const playSrc = document.querySelector('#j-src').value;
              window.ReactNativeWebView.postMessage(playSrc);
            },500)
        },8000)
        true;
        `;

      default:
        return "";
    }
  }
}

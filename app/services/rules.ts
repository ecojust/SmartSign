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

  static getSearchListScript(key: string) {
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
                  index:index
                })
            });
            window.ReactNativeWebView.postMessage(JSON.stringify(res));

          
        },8000)
        true;
        `;

      case "jbsou1":
        return `
        window.onload = ()=>{
            // const lis = document.querySelectorAll('.aplayer-list li');

            // document.querySelector('.am-topbar')?.remove();
            // document.querySelector('.google-auto-placed')?.remove();
            // document.querySelector('.am-padding-vertical')?.remove();
            // document.querySelector('.am-text-center')?.remove();
            // document.querySelector('#j-back')?.remove();
            // document.querySelector('#myhkplayer')?.remove();
            // const res = [];
            // lis.forEach((item,index)=>{
            //     res.push({
            //       title:item.querySelector('.aplayer-list-title').innerText,
            //       author:item.querySelector('.aplayer-list-author').innerText,
            //       index:index
            //     })
            // });
            // window.ReactNativeWebView.postMessage(JSON.stringify(res));
            window.ReactNativeWebView.postMessage(666);

        }
        true;
        `;

      default:
        return "";
    }
  }

  static getSearchResourceScript(key: string) {
    switch (key) {
      case "hifini":
        return `
        
        
        `;
    }
  }
}

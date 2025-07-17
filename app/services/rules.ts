export default class Music {
  static sites: Array<any> = [
    {
      name: "jbsou",
      key: "jbsou",
      steps: ["searchList"],
    },
    {
      name: "hifini",
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
            const lis = document.querySelector('.aplayer-list li');
            const res = [];
            lis.forEach((item,index)=>{
                res.push({
                  title:item.querySelector('.aplayer-list-title').innerText(),
                  author:item.querySelector('.aplayer-list-author').innerText(),
                  index:index
                })
            });
            window.ReactNativeWebView.postMessage(res);
        },3000)
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

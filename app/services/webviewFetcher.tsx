import React, { useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { DimensionValue, View, type ViewProps } from "react-native";

interface WebViewFetcherProps {
  url: string;
  onContentFetched: (content: string) => void;
  height: DimensionValue;
  injectedScript: string;
  scanRequest?: boolean;
}

const scanRequestScript = `
  var originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
        action:'request',
        data:url
      }));
    this.addEventListener('load', function() {
      console.log('Response URL:', url); // 打印响应的URL（可选）
    });
    originalOpen.call(this, method, url, async, user, password);
  };
`;

const aTagNoJump = `
  window.open = function(url) {
    window.location = url;
  };
  var links = document.querySelectorAll('a[target="_blank"]');
  for (var i = 0; i < links.length; i++) {
    links[i].setAttribute('target', '_self');
  }
`;

export const WebViewFetcher = ({
  url,
  onContentFetched,
  height = 300,
  injectedScript = "",
  scanRequest = false,
}: WebViewFetcherProps) => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  const handleMessage = (event: any) => {
    const content = event.nativeEvent.data;
    onContentFetched(content);
  };

  return (
    <View style={{ height: height, opacity: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onLoad={() => setLoading(false)}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={`
         ${scanRequest ? scanRequestScript : ""}
        `}
        injectedJavaScript={`
          (function() {
            ${aTagNoJump}
          })();
          ${injectedScript}
        `}
        setSupportMultipleWindows={false}
      />
    </View>
  );
};

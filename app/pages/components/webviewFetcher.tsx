import React, { useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { DimensionValue, View, type ViewProps } from "react-native";

interface WebViewFetcherProps {
  url: string;
  onContentFetched: (content: string) => void;
  height: DimensionValue;
  injectedScript: string;
}

export const WebViewFetcher = ({
  url,
  onContentFetched,
  height = 300,
  injectedScript = "",
}: WebViewFetcherProps) => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  const httpListenerScript = `
    var originalOpen = XMLHttpRequest.prototype.open;
    console.log('originalOpen');
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      console.log('Request URL:', url); // 打印请求的URL
      this.addEventListener('load', function() {
        console.log('Response URL:', url); // 打印响应的URL（可选）
      });
      originalOpen.call(this, method, url, async, user, password);
    };
  
  `;

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
        injectedJavaScriptBeforeContentLoaded={
          httpListenerScript + injectedScript
        }
      />
    </View>
  );
};

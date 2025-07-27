import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState, useRef } from "react";
import MusicSwiper from "./swipers/music";
import VideoSwiper from "./swipers/video";
//@ts-ignore
import ToastManager, { Toast } from "expo-react-native-toastify";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [modes, setModes] = useState(["music", "video"]);
  const [currentMode, setCurrentMode] = useState("music");

  const musicSwiperRef = useRef<any>(null);

  // 通过脚本切换 Swiper 示例：
  const goToSwiperIndex = (index: number) => {
    switch (currentMode) {
      case "music":
        if (musicSwiperRef.current && musicSwiperRef.current.goToSwiperIndex) {
          musicSwiperRef.current.goToSwiperIndex(index);
        }
        break;
    }
  };

  const destroySwiper = async () => {
    switch (currentMode) {
      case "music":
        if (musicSwiperRef.current && musicSwiperRef.current.destroy) {
          await musicSwiperRef.current.destroy();
        }
        break;
    }
  };

  useEffect(() => {
    console.log("redner");
  }, []);

  const switchMode = async () => {
    await destroySwiper();
    const currentModeIndex = modes.findIndex((m) => m == currentMode);
    const length = modes.length;
    if (currentModeIndex + 1 >= length) {
      setCurrentMode(modes[0]);
    } else {
      setCurrentMode(modes[currentModeIndex + 1]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* 选项卡 */}
      <ToastManager />
      <View style={styles.tabSection}>
        <View style={styles.tabs}>
          <ThemedText
            onPress={() => goToSwiperIndex(0)}
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
          >
            搜索
          </ThemedText>

          <ThemedText onPress={() => switchMode()} style={[styles.mode]}>
            音乐
          </ThemedText>

          <ThemedText
            onPress={() => goToSwiperIndex(1)}
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
          >
            列表
          </ThemedText>
        </View>

        {currentMode == "music" && (
          <MusicSwiper
            ref={musicSwiperRef}
            onSwiperChange={(index) => {
              setActiveTab(index);
            }}
          />
        )}

        {currentMode == "video" && (
          <VideoSwiper
            ref={musicSwiperRef}
            onSwiperChange={(index) => {
              setActiveTab(index);
            }}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabSection: {
    backgroundColor: "#FFF",
    flex: 1,
  },
  mode: {
    // backgroundColor: "#555",
    backgroundColor: "#1DB954",
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginLeft: 5,
    color: "#fff",
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: "#000",
    // borderRadius: 4,
    paddingVertical: 4,
    // marginTop: 12,
    marginBottom: 8,
    // 去除阴影和立体感
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 12,
    // overflow: "hidden",
  },
  tab: {
    fontSize: 16,
    paddingVertical: 7,
    paddingHorizontal: 18,
    color: "#ffffff",
    height: "100%",
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.0)",
    fontWeight: "bold",
    overflow: "hidden",
  },
  activeTab: {
    color: "#ff9000",
    backgroundColor: "rgba(235,235,235,0.99)",
    borderBottomWidth: 0,
    borderColor: "transparent",
    // 去除阴影
    fontWeight: "bold",
  },
});

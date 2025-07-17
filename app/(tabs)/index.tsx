import {
  Image,
  StyleSheet,
  Platform,
  View,
  Dimensions,
  TextInput,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* 顶部状态栏 */}
      <View style={styles.statusBar}>
        <ThemedText style={styles.time}>23:12</ThemedText>
        <View style={styles.statusIcons}>
          {/* 假设这里是信号、Wi-Fi、电池图标 */}
          <ThemedText>📶</ThemedText>
          <ThemedText>📡</ThemedText>
          <ThemedText>🔋80%</ThemedText>
        </View>
      </View>

      {/* 标题栏 */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>发现音乐</ThemedText>
        <View style={styles.headerIcons}>
          {/* 假设这里是两个图标 */}
          <ThemedText>···</ThemedText>
          <ThemedText>◎</ThemedText>
        </View>
      </View>

      {/* 选项卡和搜索区域 */}
      <View style={styles.searchSection}>
        <View style={styles.tabs}>
          <ThemedText style={[styles.tab, styles.activeTab]}>
            音乐搜索
          </ThemedText>
          <ThemedText style={styles.tab}>播放器</ThemedText>
          <ThemedText style={styles.tab}>播放列表</ThemedText>
        </View>
        <Swiper
          style={styles.wrapper}
          showsButtons={false}
          loop={false}
          dotStyle={styles.dotStyle}
          activeDotStyle={styles.activeDotStyle}
        >
          <View style={styles.slide}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="王心凌"
                placeholderTextColor="#333"
              />
            </View>
            <View style={styles.searchButton}>
              <ThemedText style={styles.searchButtonText}>搜索</ThemedText>
            </View>
          </View>
          <View style={styles.slide}>
            <ThemedText>播放器内容</ThemedText>
          </View>
          <View style={styles.slide}>
            <ThemedText>播放列表内容</ThemedText>
          </View>
        </Swiper>
      </View>

      {/* 底部播放控制条 */}
      <View style={styles.bottomPlayer}>
        <ThemedText style={styles.songTitle}>凄美地</ThemedText>
        <View style={styles.playerControls}>
          {/* 假设这里是播放控制图标 */}
          <ThemedText>≡</ThemedText>
          <ThemedText>Ⅱ</ThemedText>
          <ThemedText>▷|</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0BBE4",
    paddingTop: Platform.OS === "ios" ? 40 : 0, // Adjust for iOS notch
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusIcons: {
    flexDirection: "row",
    gap: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  searchSection: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    height: 250, // Increased height to accommodate Swiper
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 15,
    width: "100%",
    justifyContent: "space-around",
  },
  tab: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: "#888",
  },
  activeTab: {
    color: "#E0BBE4",
    borderBottomWidth: 2,
    borderColor: "#E0BBE4",
  },
  wrapper: {
    // No specific styles needed for the wrapper itself, children will define layout
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  searchBox: {
    width: "90%",
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    width: "90%",
    backgroundColor: "#E0BBE4",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dotStyle: {
    backgroundColor: "rgba(0,0,0,.2)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDotStyle: {
    backgroundColor: "#E0BBE4",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  bottomPlayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    height: 70,
  },
  albumCover: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  songTitle: {
    color: "#FFF",
    fontSize: 16,
    flex: 1,
  },
  playerControls: {
    flexDirection: "row",
    gap: 15,
  },
});

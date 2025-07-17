import {
  Image,
  StyleSheet,
  Platform,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Swiper from "react-native-swiper";
import { useEffect, useState, useRef } from "react";
import { WebViewFetcher } from "./services/webviewFetcher";
import Music from "./services/rules";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [debugOpen, setDebugOpen] = useState(true);
  const [fetchUrl, setFetchUrl] = useState("https://www.baidu.com");
  const [injectScript, setInjectScript] = useState("");
  const [step, setStep] = useState("");
  const [sites, setSites] = useState<any[]>([]);
  const [songlist, setSonglist] = useState<any[]>([]);

  const [selectedSite, setSelectedSite] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("就是我");

  const swiperRef = useRef<Swiper>(null);

  const handleSwiperIndexChange = (index: number) => {
    setActiveTab(index);
    console.log("Current Swiper index:", index);
  };

  const handleSearch = () => {
    console.log("Selected Site:", selectedSite);
    console.log("Search Text:", searchText);
    // 在这里添加搜索逻辑
    if (selectedSite && searchText) {
      // setDebugOpen(true);
      const url = Music.getSearchListUrl(selectedSite, searchText);
      setFetchUrl(url);
      setInjectScript(Music.getSearchListScript(selectedSite));

      console.log(url);
    }
  };

  const handleContentFetched = async (str: string) => {
    const songlist = JSON.parse(str);
    console.log(songlist);
    setSonglist(songlist);
  };

  useEffect(() => {
    setFetchUrl("https://www.baidu.com");
    setSites(Music.sites);
    if (Music.sites.length > 0) {
      setSelectedSite(Music.sites[0].key);
    }
    console.log("redner");
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* 选项卡和搜索区域 */}
      <View style={styles.searchSection}>
        <View style={styles.tabs}>
          <ThemedText style={[styles.tab, activeTab === 0 && styles.activeTab]}>
            音乐搜索
          </ThemedText>
          <ThemedText style={[styles.tab, activeTab === 1 && styles.activeTab]}>
            播放器
          </ThemedText>
          <ThemedText style={[styles.tab, activeTab === 2 && styles.activeTab]}>
            播放列表
          </ThemedText>
        </View>

        <Swiper
          style={styles.wrapper}
          showsButtons={false}
          loop={false}
          dotStyle={styles.dotStyle}
          onIndexChanged={handleSwiperIndexChange}
          activeDotStyle={styles.activeDotStyle}
        >
          <View key="searchTab" style={styles.slide}>
            <View style={styles.searchBox}>
              {/* <TextInput
                style={styles.searchInput}
                placeholder="请输入关键字"
                placeholderTextColor="#dbdbdb"
                value={searchText}
              /> */}

              <TextInput
                style={styles.searchInput}
                placeholder="请输入内容"
                placeholderTextColor="#dbdbdb"
                value={searchText}
                onChangeText={(value) => setSearchText(value)}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <ThemedText style={styles.searchButtonText}>搜索</ThemedText>
            </TouchableOpacity>

            <View style={styles.siteSelection}>
              {sites.map((site, index) => (
                <TouchableOpacity
                  key={site.key}
                  style={[
                    styles.siteOption,
                    selectedSite === site.key && styles.selectedSiteOption,
                  ]}
                  onPress={() => setSelectedSite(site.key)}
                >
                  <ThemedText
                    style={[
                      styles.siteOptionText,
                      selectedSite === site.key &&
                        styles.selectedSiteOptionText,
                    ]}
                  >
                    {site.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.searchResult}>
              <FlatList
                data={songlist}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <ThemedText>{item.title}</ThemedText>
                    <ThemedText>{item.author}</ThemedText>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.debugWeb}>
              {debugOpen && (
                <WebViewFetcher
                  injectedScript={injectScript}
                  height={440}
                  url={fetchUrl}
                  onContentFetched={handleContentFetched}
                />
              )}
            </View>
          </View>

          <View key="playerTab" style={styles.slide}>
            <ThemedText>播放器内容</ThemedText>
          </View>

          <View key="playlistTab" style={styles.slide}>
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
    backgroundColor: "#ffffff",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
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
  },

  searchSection: {
    backgroundColor: "#FFF",
    flex: 1,
  },

  searchResult: {
    height: 330,
  },
  tabs: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: "#FFff00",
  },
  tab: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: "#888000",
    height: "100%",
  },
  activeTab: {
    color: "#E0BBE4",
    borderBottomWidth: 2,
    borderColor: "#E0BBE4",
  },
  wrapper: {
    // No specific styles needed for the wrapper itself, children will define layout
    borderColor: "red",
    // flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    height: 200,
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
  siteSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  siteOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0BBE4",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  selectedSiteOption: {
    backgroundColor: "#E0BBE4",
  },
  siteOptionText: {
    color: "#E0BBE4",
    fontSize: 14,
  },
  selectedSiteOptionText: {
    color: "#FFF",
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
  debugWeb: {
    borderColor: "#E0BBE4",
    borderWidth: 1,
    width: "100%",
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

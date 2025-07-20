import {
  Image,
  StyleSheet,
  Platform,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swiper from "react-native-swiper";
import { useEffect, useState, useRef } from "react";
import { WebViewFetcher } from "./services/webviewFetcher";
import Music from "./services/rules";
import MusicPlayer from "./components/MusicPlayer";
import { Alert } from "react-native";
import Toast from "react-native-root-toast";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showRefreshWebview, setShowRefreshWebview] = useState(false);
  const [showSearchWebview, setShowSearchWebview] = useState(false);

  const [fetchUrl, setFetchUrl] = useState("https://www.baidu.com");
  const [injectScript, setInjectScript] = useState("");
  const [sites, setSites] = useState<any[]>([]);
  const [songlist, setSonglist] = useState<any[]>([]);
  const [localSonglist, setLocalSonglist] = useState<any[]>([]);

  const [currentSong, setCurrentSong] = useState<any>({});

  const [selectedSite, setSelectedSite] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const swiperRef = useRef<any>(null);

  const handleSwiperIndexChange = (index: number) => {
    setActiveTab(index);
  };

  // 通过脚本切换 Swiper 示例：
  const goToSwiperIndex = (index: number) => {
    if (swiperRef.current && swiperRef.current.scrollBy) {
      swiperRef.current.scrollBy(index - swiperRef.current.state.index, true);
    }
  };

  const playSong = (item: any) => {
    console.log("playSong", item);
    setCurrentSong(item);
  };

  const handleSongLoadError = (error: { song: any; error: Error }) => {
    setShowRefreshWebview(false);
    console.log("歌曲无法加载，需要更新", error.song);
    Toast.show("歌曲无法加载，即将自动更新", {
      duration: Toast.durations.SHORT,
    });
    setFetchUrl(error.song.url);

    const siteKey = error.song.siteKey || "22a5";
    switch (siteKey) {
      case "22a5":
        setInjectScript(
          Music.getRefreshScript(siteKey, {
            auto: true,
            delay: 3000,
          })
        );
        break;
      default:
        setInjectScript(
          Music.getRefreshScript(siteKey, {
            auto: false,
            delay: 30000,
          })
        );
        break;
    }
    setTimeout(() => {
      setShowRefreshWebview(true);
    }, 1000);
  };

  const handleSongPlayEnd = (error: { song: any; error: Error }) => {
    const currentIndex = localSonglist.findIndex(
      (item) => item.src === currentSong.src
    );

    console.log("handleSongPlayEnd");
    if (currentIndex !== -1 && currentIndex < localSonglist.length - 1) {
      playSong(localSonglist[currentIndex + 1]);
      console.log("play next");
    } else {
      playSong(localSonglist[0]);
      console.log("play 0");
    }
  };

  const musicPlayerRef = useRef<any>(null);
  const handleSearch = () => {
    if (musicPlayerRef.current && musicPlayerRef.current.pause) {
      musicPlayerRef.current.pause();
    }
    // 在这里添加搜索逻辑
    if (selectedSite && searchText) {
      setShowSearchWebview(false);
      const url = Music.getSearchUrl(selectedSite, searchText);
      setFetchUrl(url);
      setInjectScript(Music.getSearchScript(selectedSite));
      setTimeout(() => {
        console.log("开始搜索歌曲：", url);
        setShowSearchWebview(true);
      }, 1000);
    } else {
      Toast.show("请输入搜索关键字", {
        duration: Toast.durations.SHORT,
      });
    }
  };

  // const handleSongPress = async (item: any) => {
  //   setCurrentSong(item);
  //   setShowSearchWebview(false);
  //   setFetchUrl(item.url);
  //   setInjectScript(Music.getSearchResourceScript(selectedSite, item));

  //   setTimeout(() => {
  //     setShowSearchWebview(true);
  //   }, 1000);
  //   setShowResult(false); // 隐藏搜索结果弹窗
  // };

  const readLocalSongs = async () => {
    const songs = await AsyncStorage.getItem("localSonglist");
    if (songs) {
      setLocalSonglist(JSON.parse(songs));
    }
  };

  // 移除本地歌曲方法
  const removeSongFromLocal = async (removeIndex: number) => {
    const updatedList = localSonglist.filter((_, idx) => idx !== removeIndex);
    setLocalSonglist(updatedList);
    // 假设使用 AsyncStorage 进行本地持久化
    if (typeof AsyncStorage !== "undefined") {
      await AsyncStorage.setItem("localSonglist", JSON.stringify(updatedList));
    }
    // 若当前播放歌曲被移除，自动切换播放状态
    if (
      currentSong &&
      localSonglist[removeIndex] &&
      currentSong.src === localSonglist[removeIndex].src
    ) {
      setCurrentSong(undefined);
    }
  };

  const pushOrRefreshSong = async (item: any) => {
    console.log("pushOrRefreshSong");
    try {
      // const localSong = await AsyncStorage.getItem("localSonglist");
      // let newlocalsong = [];
      // if (localSong) {
      //   newlocalsong = JSON.parse(localSong);
      //   newlocalsong.push(item);
      // } else {
      //   newlocalsong = [item];
      // }

      const newList = [...localSonglist];
      const idx = newList.findIndex((s) => s.url === item.url);
      if (idx !== -1) {
        newList[idx] = item;
        Toast.show(`歌曲${item.title}已更新`, {
          duration: Toast.durations.SHORT,
        });
      } else {
        newList.push(item);
        Toast.show(`歌曲${item.title}已添加`, {
          duration: Toast.durations.SHORT,
        });
      }
      setLocalSonglist(newList);
      await AsyncStorage.setItem("localSonglist", JSON.stringify(newList));
    } catch (e) {
      console.error("Error saving song to AsyncStorage:", e);
    }
  };

  const handleContentFetched = async (str: string) => {
    const msg = JSON.parse(str);
    if (!msg.action) {
      return;
    }

    // console.log(msg.action);
    // console.log(msg.data);
    switch (msg.action) {
      case "songResource":
        console.log("handleContentFetched-----songResource");

        await pushOrRefreshSong(msg.data);
        setShowSearchWebview(false);
        goToSwiperIndex(1);

        setTimeout(() => {
          setCurrentSong(msg.data);
        }, 1000);
        break;

      case "refreshResource":
        console.log("handleContentFetched-----refreshResource");

        await pushOrRefreshSong(msg.data);
        setShowRefreshWebview(false);
        goToSwiperIndex(1);
        setTimeout(() => {
          setCurrentSong(msg.data);
        }, 1000);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    setFetchUrl("https://www.baidu.com");
    setSites(Music.sites);
    if (Music.sites.length > 0) {
      setSelectedSite(Music.sites[0].key);
    }
    readLocalSongs();
    console.log("redner");
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* 选项卡和搜索区域 */}
      <View style={styles.searchSection}>
        <View style={styles.tabs}>
          <ThemedText
            onPress={() => goToSwiperIndex(0)}
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
          >
            音乐搜索
          </ThemedText>
          <ThemedText
            onPress={() => goToSwiperIndex(1)}
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
          >
            播放器
          </ThemedText>
          <ThemedText
            onPress={() => goToSwiperIndex(2)}
            style={[styles.tab, activeTab === 2 && styles.activeTab]}
          >
            播放列表
          </ThemedText>
        </View>

        <Swiper
          ref={swiperRef}
          style={styles.wrapper}
          showsButtons={false}
          removeClippedSubviews={false}
          loop={false}
          dotStyle={styles.dotStyle}
          onIndexChanged={handleSwiperIndexChange}
          activeDotStyle={styles.activeDotStyle}
        >
          <View key="searchTab" style={styles.slide}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="请输入内容"
                placeholderTextColor="#dbdbdb"
                // value={searchText}
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

            <Modal
              animationType="slide"
              transparent={true}
              visible={showResult}
              onRequestClose={() => {
                setShowResult(!showResult);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <FlatList
                    data={songlist}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.songItem}
                        // onPress={() => handleSongPress(item)}
                      >
                        <ThemedText style={styles.songTitleText}>
                          {item.title}
                        </ThemedText>
                        <ThemedText style={styles.songAuthorText}>
                          {item.author}
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowResult(false)}
                  >
                    <ThemedText style={styles.textStyle}>关闭</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={styles.debugWeb}>
              {showSearchWebview && (
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
            <MusicPlayer
              ref={musicPlayerRef}
              song={currentSong}
              onSongLoadError={handleSongLoadError}
              onSongPlayEnd={handleSongPlayEnd}
            />

            {/* <Modal
              animationType="slide"
              transparent={true}
              visible={showRefresh}
              onRequestClose={() => {
                setShowRefresh(!showRefresh);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <WebViewFetcher
                    injectedScript={injectScript}
                    height={440}
                    url={fetchUrl}
                    onContentFetched={handleContentFetched}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowRefresh(false)}
                  >
                    <ThemedText style={styles.textStyle}>关闭</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}

            {/* <View style={styles.debugWeb}>
              {
                <WebViewFetcher
                  injectedScript={injectScript}
                  height={440}
                  url={fetchUrl}
                  onContentFetched={handleContentFetched}
                />
              }
            </View> */}
          </View>

          <View key="playlistTab" style={styles.slide}>
            <View style={styles.debugWeb}>
              {showRefreshWebview && (
                <WebViewFetcher
                  injectedScript={injectScript}
                  height={440}
                  url={fetchUrl}
                  onContentFetched={handleContentFetched}
                />
              )}
            </View>
            <FlatList
              data={localSonglist}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.songItem,
                    currentSong && currentSong.url === item.url
                      ? styles.playingSongItem
                      : null,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.songInfo}
                    onPress={() => playSong(item)}
                  >
                    <ThemedText style={styles.songTitleText}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.songAuthorText}>
                      {item.author}
                    </ThemedText>
                    {/* <ThemedText style={styles.songTitleText} numberOfLines={1}>
                      {item.duration}
                    </ThemedText> */}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSongFromLocal(index)}
                  >
                    <ThemedText style={styles.removeButtonText}>
                      移除
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            />
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
  songList: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
    paddingHorizontal: 10,
    width: "100%",
  },

  songInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  songTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",

    height: 26,
  },
  songAuthorText: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: "#E57373",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  playingSongItem: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD54F",
    borderWidth: 1,
    shadowColor: "#FFD54F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 2,
  },
  playingTag: {
    color: "#FFD54F",
    fontSize: 12,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: "#fffbe6",
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 8,
    // 去除阴影和立体感
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: undefined,
    overflow: "hidden",
  },
  tab: {
    fontSize: 16,
    paddingVertical: 7,
    paddingHorizontal: 18,
    color: "#888000",
    height: "100%",
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "transparent",
    fontWeight: "bold",
    overflow: "hidden",
  },
  activeTab: {
    color: "#fff",
    backgroundColor: "#ffe066",
    borderBottomWidth: 0,
    borderColor: "transparent",
    // 去除阴影
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: undefined,
    fontWeight: "bold",
  },

  wrapper: {
    // No specific styles needed for the wrapper itself, children will define layout
    borderColor: "red",
    // flex: 1,
    backgroundColor: "#ffffff",
  },
  slide: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: "auto",
  },
  searchBox: {
    width: "90%",
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  searchInput: {
    fontSize: 26,
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
    display: "none",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    height: "70%",
  },
  closeButton: {
    backgroundColor: "#E0BBE4",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
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

// 在文件顶部 function HomeScreen 之前添加辅助函数
function formatDuration(duration: number | string) {
  if (typeof duration === "string") {
    duration = parseFloat(duration);
  }
  if (isNaN(duration) || duration <= 0) return "--:--";
  const min = Math.floor(duration / 60);
  const sec = Math.floor(duration % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

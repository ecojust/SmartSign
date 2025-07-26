import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import { Linking } from "react-native";
import { WebViewFetcher } from "../services/webviewFetcher";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Music from "@/app/services/rules";

interface MusicPlayerProps {
  song: any;
  onSongLoadError?: (error: { song: any; error: Error }) => void;
  onSongPlayEnd?: (error: { song: any; error: Error }) => void;
  onNextSong?: () => void;
  ref: any;
}

const MusicPlayer: React.FC<MusicPlayerProps> = forwardRef(
  ({ song, onSongLoadError, onSongPlayEnd, onNextSong }, ref) => {
    const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isExpanded, setIsExpanded] = useState(true);
    const [slideAnim] = useState(new Animated.Value(0));

    useImperativeHandle(ref, () => ({
      playSong,
      handlePlayPause,
      onSliderValueChange,
      pause: async () => {
        if (sound && isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
      },
      resume: async () => {
        if (sound && !isPlaying) {
          await sound.playAsync();
          setIsPlaying(true);
        }
      },
    }));

    useEffect(() => {
      if (song && song.src) {
        setPosition(0);
        setDuration(0);
        setIsPlaying(false);
        playSong(song.src);
      } else if (sound) {
        sound.unloadAsync();
        setSound(undefined);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [song]);

    const playSong = async (uri: string) => {
      if (sound) {
        await sound.unloadAsync();
      }
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setPosition(0);
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        if (onSongLoadError) {
          onSongLoadError({
            song,
            error: new Error("歌曲无法加载，需要更新"),
          });
        }

        // console.error("音频资源加载失败:", error);
      }
    };

    const onPlaybackStatusUpdate = (status: any) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
        setIsPlaying(status.isPlaying);
        console.log(status.positionMillis, status.durationMillis);

        if (status.durationMillis - status.positionMillis <= 1000) {
          console.log("歌曲播放结束");
          if (onSongPlayEnd) {
            onSongPlayEnd({
              song,
              error: new Error("歌曲播放结束"),
            });
          }
        }
      }

      // console.log("onPlaybackStatusUpdate", status);
    };

    const handlePlayPause = async () => {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const onSliderValueChange = async (value: number) => {
      if (sound) {
        await sound.setPositionAsync(value);
      }
    };

    const toggleExpanded = () => {
      const toValue = isExpanded ? 0 : 1;
      setIsExpanded(!isExpanded);

      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const handleNextSong = () => {
      if (onNextSong) {
        onNextSong();
      }
    };

    const formatTime = (millis: number) => {
      const minutes = Math.floor(millis / 60000);
      const seconds = ((millis % 60000) / 1000).toFixed(0);
      return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
    };

    return (
      <View style={styles.container}>
        {song && song.title ? (
          <View style={styles.playerContainer}>
            {/* 简短模式 - 始终显示 */}
            <View style={styles.compactPlayer}>
              <View style={styles.songInfo}>
                <Text style={styles.compactTitle} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.compactArtist} numberOfLines={1}>
                  {song.author}
                </Text>
              </View>

              <View style={styles.timeDisplay}>
                <Text style={styles.compactTime}>
                  {formatTime(position)} / {formatTime(duration)}
                </Text>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity
                  onPress={handlePlayPause}
                  style={styles.compactButton}
                >
                  <Text style={styles.compactButtonText}>
                    {isPlaying ? "⏸" : "▶"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNextSong}
                  style={styles.compactButton}
                >
                  <Text style={styles.compactButtonText}>⏭</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={toggleExpanded}
                  style={styles.detailButton}
                >
                  <Text style={styles.detailButtonText}>
                    {isExpanded ? "收起" : "详情"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 进度条 - 始终显示 */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        duration > 0 ? `${(position / duration) * 100}%` : "0%",
                    },
                  ]}
                />
              </View>
            </View>

            {/* 详情模式 - 动画展开 */}
            <Animated.View
              style={[
                styles.expandedPlayer,
                {
                  height: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 145],
                  }),
                  opacity: slideAnim,
                },
              ]}
            >
              <View style={styles.detailContent}>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>源站标识：</Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    selectable
                  >
                    {song.siteKey}
                  </Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>音频地址：</Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    selectable
                  >
                    {song.src}
                  </Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>来源链接：</Text>
                  <Text
                    style={styles.infoValue}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    selectable
                  >
                    {song.url}
                  </Text>
                </View>

                {/* <TouchableOpacity
                  onPress={handlePlayPause}
                  style={[
                    styles.playButton,
                    { position: "relative", overflow: "hidden" },
                  ]}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width:
                        duration > 0 ? `${(position / duration) * 100}%` : "0%",
                      backgroundColor: "rgba(255,255,255,0.3)",
                      zIndex: 1,
                    }}
                  />
                  <Text
                    style={[
                      styles.playButtonText,
                      { zIndex: 2, textAlign: "center", width: "100%" },
                    ]}
                  >
                    {isPlaying ? "暂停" : "播放"}
                  </Text>
                </TouchableOpacity> */}
              </View>
            </Animated.View>
          </View>
        ) : (
          <Text style={styles.noSongText}>请选择一首歌曲播放</Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#282828",
    // padding: 20,
    borderColor: "rgb(255,0,0)",
    borderWidth: 2,
  },
  playerContainer: {
    width: "100%",
    // borderColor: "rgb(255,155,0)",
    // borderWidth: 2,
    flexDirection: "column-reverse",
    position: "absolute",
    bottom: 0,
  },
  // 进度条样式
  progressContainer: {
    width: "100%",
    paddingHorizontal: 15,
    marginBottom: -6,
    // display: "none",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#555",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1DB954",
  },
  // 简短模式样式
  compactPlayer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#333",
    borderRadius: 10,
    // marginBottom: 5,
    // borderColor: "rgb(255,255,0)",
    // borderWidth: 2,
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  compactArtist: {
    fontSize: 14,
    color: "#b3b3b3",
  },
  timeDisplay: {
    marginRight: 10,
  },
  compactTime: {
    fontSize: 12,
    color: "#b3b3b3",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 5,
  },
  compactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  detailButton: {
    backgroundColor: "#555",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 5,
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 12,
  },

  // 详情模式样式
  expandedPlayer: {
    width: "100%",
    overflow: "hidden",
    // borderColor: "rgb(155,155,0)",
    // borderWidth: 2,
  },
  detailContent: {
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  artist: {
    fontSize: 18,
    color: "#b3b3b3",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
  },
  timeText: {
    color: "#b3b3b3",
    fontSize: 12,
  },
  playButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noSongText: {
    color: "#b3b3b3",
    fontSize: 16,
  },
  infoBlock: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#b3b3b3",
    fontWeight: "normal",
  },
  infoValue: {
    fontSize: 13,
    color: "#fff",
  },
  infoUrl: {
    textDecorationLine: "underline",
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
    borderWidth: 1,
    borderColor: "#E0BBE4",
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
  webViewContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 300,
    position: "absolute",
    top: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#E0BBE4",
  },
});

export default MusicPlayer;

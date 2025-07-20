import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
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
  ref: any;
}

const MusicPlayer: React.FC<MusicPlayerProps> = forwardRef(
  ({ song, onSongLoadError, onSongPlayEnd }, ref) => {
    const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

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

    const formatTime = (millis: number) => {
      const minutes = Math.floor(millis / 60000);
      const seconds = ((millis % 60000) / 1000).toFixed(0);
      return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
    };

    return (
      <View style={styles.container}>
        {song && song.title ? (
          <View>
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
                style={[styles.infoValue]}
                numberOfLines={1}
                ellipsizeMode="middle"
                selectable
                // onPress={() => song.url && Linking.openURL(song.url)}
              >
                {song.url}
              </Text>
            </View>
            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.artist}>{song.author}</Text>

            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            <TouchableOpacity
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
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noSongText}>请选择一首歌曲播放</Text>
        )}

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
            <View style={styles.webViewContainer}>
              {debugOpen && (
                <WebViewFetcher
                  injectedScript={injectScript}
                  height={440}
                  url={fetchUrl}
                  onContentFetched={handleContentFetched}
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRefresh(false)}
            >
              <ThemedText style={styles.textStyle}>关闭</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

        {/* {modalVisible && (
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            
            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={() => setModalVisible(false)}
            >
              <Text>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      )} */}

        {/* <View style={styles.webViewContainer}>
        {debugOpen && (
          <WebViewFetcher
            injectedScript={injectScript}
            height={440}
            url={fetchUrl}
            onContentFetched={handleContentFetched}
          />
        )}
      </View> */}
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
    padding: 20,
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

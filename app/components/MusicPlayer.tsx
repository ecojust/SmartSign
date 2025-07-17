import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";

interface MusicPlayerProps {
  song: any;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song }) => {
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (song && song.src) {
      playSong(song.src);
    } else if (sound) {
      sound.unloadAsync();
      setSound(undefined);
      setIsPlaying(false);
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
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
    setIsPlaying(true);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
    }

    console.log("onPlaybackStatusUpdate", status);
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
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.author}</Text>
          {/* <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={onSliderValueChange}
            thumbTintColor="#fff"
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#888"
          /> */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Text style={styles.playButtonText}>
              {isPlaying ? "暂停" : "播放"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noSongText}>请选择一首歌曲播放</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
});

export default MusicPlayer;

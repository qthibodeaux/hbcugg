import { useRef, useState } from "react";

export const useBandPlayback = (tracks) => {
  const audioRef = useRef(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const track = tracks[trackIdx] || tracks[0];

  const selectTrack = (i) => {
    if (i === trackIdx) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setTrackIdx(i);
  };
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(p => !p);
  };
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(ct);
    setProgress(dur > 0 ? (ct / dur) * 100 : 0);
  };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleEnded = () => setIsPlaying(false);
  const handleScrub = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
  };

  return {
    audioRef, trackIdx, isPlaying, progress, currentTime, duration, track,
    selectTrack, togglePlay, handleTimeUpdate, handleLoadedMetadata, handleEnded, handleScrub,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { YakPost, YakComment, Poll } from '../types/yak';
import { INITIAL_YAKS, ANONYMOUS_AVATARS, ADJECTIVES } from '../data/initialYaks';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';

const STORAGE_KEY = 'campusyak_posts_store_v1';
const DEVICE_KEY = 'campusyak_device_id_v1';
const SAVED_KEY = 'campusyak_saved_ids_v1';
const USER_PROFILE_KEY = 'campusyak_user_profile_v1';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device';
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = 'yak-dev-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

export function getRandomAnonymousIdentity() {
  const avatar = ANONYMOUS_AVATARS[Math.floor(Math.random() * ANONYMOUS_AVATARS.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  return {
    alias: `${adj} ${avatar.name}`,
    avatar: avatar.icon,
  };
}

export function useYakStore() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [posts, setPosts] = useState<YakPost[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{ alias: string; avatar: string }>({
    alias: 'Curious Badger',
    avatar: '🦡',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize device & load user identity preferences
  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);

    // Profile
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch {
        const fresh = getRandomAnonymousIdentity();
        setUserProfile(fresh);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(fresh));
      }
    } else {
      const fresh = getRandomAnonymousIdentity();
      setUserProfile(fresh);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(fresh));
    }

    // Saved bookmarks
    const storedSaved = localStorage.getItem(SAVED_KEY);
    if (storedSaved) {
      try {
        setSavedIds(JSON.parse(storedSaved));
      } catch {
        setSavedIds([]);
      }
    }
  }, []);

  // REAL-TIME FIRESTORE LISTENER FOR POSTS
  useEffect(() => {
    const postsCol = collection(db, 'posts');
    const unsubscribe = onSnapshot(
      postsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial campus Quad yaks into Firestore
          try {
            for (const yak of INITIAL_YAKS) {
              await setDoc(doc(db, 'posts', yak.id), yak);
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'posts');
          }
          setPosts(INITIAL_YAKS);
        } else {
          const loaded: YakPost[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as YakPost);
          });
          setPosts(loaded);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
          } catch {}
        }
        setIsLoaded(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        // Offline cache fallback
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setPosts(JSON.parse(stored));
          } catch {
            setPosts(INITIAL_YAKS);
          }
        } else {
          setPosts(INITIAL_YAKS);
        }
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Vote on a Yak post (+1 or -1, with -5 Community Standards Purge)
  const votePost = useCallback(
    async (postId: string, direction: 'up' | 'down') => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;

      const hasUpvoted = targetPost.upvotes.includes(currentDevId);
      const hasDownvoted = targetPost.downvotes.includes(currentDevId);

      let newUpvotes = [...targetPost.upvotes];
      let newDownvotes = [...targetPost.downvotes];

      if (direction === 'up') {
        if (hasUpvoted) {
          newUpvotes = newUpvotes.filter((id) => id !== currentDevId);
        } else {
          newUpvotes.push(currentDevId);
          newDownvotes = newDownvotes.filter((id) => id !== currentDevId);
        }
      } else {
        if (hasDownvoted) {
          newDownvotes = newDownvotes.filter((id) => id !== currentDevId);
        } else {
          newDownvotes.push(currentDevId);
          newUpvotes = newUpvotes.filter((id) => id !== currentDevId);
        }
      }

      const newScore = newUpvotes.length - newDownvotes.length;
      const shouldRemove = newScore <= -5;
      const isRemoved = targetPost.isRemoved || shouldRemove;
      const removeReason = shouldRemove
        ? 'Removed by community standards: Reached -5 downvotes from classmates.'
        : targetPost.removeReason;

      const updatedFields = {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newScore,
        isRemoved,
        removeReason: removeReason || '',
      };

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updatedFields } : p))
      );

      // Write to Firestore - syncs across all devices!
      try {
        await updateDoc(doc(db, 'posts', postId), updatedFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
      }
    },
    [posts, deviceId]
  );

  // Report post for violating community standards
  const reportPost = useCallback(
    async (postId: string, reason: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;
      if (targetPost.reportedBy.includes(currentDevId)) return;

      const newReportedBy = [...targetPost.reportedBy, currentDevId];
      const newReportCount = newReportedBy.length;
      const shouldRemove = newReportCount >= 3;

      const updatedFields = {
        reportCount: newReportCount,
        reportedBy: newReportedBy,
        isRemoved: targetPost.isRemoved || shouldRemove,
        removeReason: shouldRemove
          ? `Flagged by ${newReportCount} classmates for: ${reason}`
          : targetPost.removeReason || '',
      };

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updatedFields } : p))
      );

      try {
        await updateDoc(doc(db, 'posts', postId), updatedFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
      }
    },
    [posts, deviceId]
  );

  // Vote in an anonymous poll
  const votePoll = useCallback(
    async (postId: string, optionId: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost || !targetPost.poll) return;

      const alreadyVoted = targetPost.poll.options.some((opt) =>
        opt.votedUserIds?.includes(currentDevId)
      );
      if (alreadyVoted) return;

      const newOptions = targetPost.poll.options.map((opt) => {
        if (opt.id === optionId) {
          return {
            ...opt,
            votes: opt.votes + 1,
            votedUserIds: [...(opt.votedUserIds || []), currentDevId],
          };
        }
        return opt;
      });

      const updatedPoll: Poll = {
        ...targetPost.poll,
        totalVotes: targetPost.poll.totalVotes + 1,
        options: newOptions,
      };

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, poll: updatedPoll } : p))
      );

      try {
        await updateDoc(doc(db, 'posts', postId), { poll: updatedPoll });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
      }
    },
    [posts, deviceId]
  );

  // Add new anonymous post (Broadcast to Firestore)
  const addPost = useCallback(
    async (data: {
      content: string;
      courseTag: string;
      topicTag?: string;
      mood?: string;
      imageUrl?: string;
      pollQuestion?: string;
      pollOptions?: string[];
    }) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const id = 'yak-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

      let pollData: Poll | undefined;
      if (data.pollQuestion && data.pollOptions && data.pollOptions.filter((o) => o.trim()).length >= 2) {
        pollData = {
          id: 'poll-' + id,
          question: data.pollQuestion.trim(),
          totalVotes: 0,
          options: data.pollOptions
            .filter((o) => o.trim())
            .map((optText, idx) => ({
              id: `opt-${idx + 1}`,
              text: optText.trim(),
              votes: 0,
              votedUserIds: [],
            })),
        };
      }

      const newPost: YakPost = {
        id,
        content: data.content.trim(),
        courseTag: data.courseTag,
        topicTag: data.topicTag || '',
        mood: data.mood || '',
        imageUrl: data.imageUrl || '',
        authorId: currentDevId,
        authorAlias: userProfile.alias,
        authorAvatar: userProfile.avatar,
        createdAt: new Date().toISOString(),
        score: 1,
        upvotes: [currentDevId],
        downvotes: [],
        commentsCount: 0,
        comments: [],
        poll: pollData,
        reportCount: 0,
        reportedBy: [],
        isRemoved: false,
      };

      // Optimistic update
      setPosts((prev) => [newPost, ...prev]);

      try {
        await setDoc(doc(db, 'posts', id), newPost);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `posts/${id}`);
      }

      return newPost;
    },
    [deviceId, userProfile]
  );

  // Add comment to a post
  const addComment = useCallback(
    async (postId: string, content: string, imageUrl?: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;

      const isOP = targetPost.authorId === currentDevId;
      const commentId = 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);

      const authorAlias = isOP ? 'OP' : userProfile.alias;
      const authorAvatar = isOP ? targetPost.authorAvatar : userProfile.avatar;

      const newComment: YakComment = {
        id: commentId,
        postId,
        authorAlias,
        authorAvatar,
        authorId: currentDevId,
        isOP,
        content: content.trim(),
        imageUrl: imageUrl || '',
        createdAt: new Date().toISOString(),
        score: 1,
        upvotes: [currentDevId],
        downvotes: [],
      };

      const updatedComments = [...targetPost.comments, newComment];
      const updatedCount = targetPost.commentsCount + 1;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, commentsCount: updatedCount, comments: updatedComments }
            : p
        )
      );

      try {
        await updateDoc(doc(db, 'posts', postId), {
          commentsCount: updatedCount,
          comments: updatedComments,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
      }
    },
    [deviceId, posts, userProfile]
  );

  // Vote comment
  const voteComment = useCallback(
    async (postId: string, commentId: string, direction: 'up' | 'down') => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;

      const updatedComments = targetPost.comments.map((comment) => {
        if (comment.id !== commentId) return comment;

        const hasUpvoted = comment.upvotes.includes(currentDevId);
        const hasDownvoted = comment.downvotes.includes(currentDevId);

        let newUpvotes = [...comment.upvotes];
        let newDownvotes = [...comment.downvotes];

        if (direction === 'up') {
          if (hasUpvoted) {
            newUpvotes = newUpvotes.filter((id) => id !== currentDevId);
          } else {
            newUpvotes.push(currentDevId);
            newDownvotes = newDownvotes.filter((id) => id !== currentDevId);
          }
        } else {
          if (hasDownvoted) {
            newDownvotes = newDownvotes.filter((id) => id !== currentDevId);
          } else {
            newDownvotes.push(currentDevId);
            newUpvotes = newUpvotes.filter((id) => id !== currentDevId);
          }
        }

        return {
          ...comment,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newUpvotes.length - newDownvotes.length,
        };
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: updatedComments } : p))
      );

      try {
        await updateDoc(doc(db, 'posts', postId), {
          comments: updatedComments,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
      }
    },
    [deviceId, posts]
  );

  // Toggle bookmark / saved locally
  const toggleSave = useCallback((postId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Delete own post (or Admin purge)
  const deleteMyPost = useCallback(
    async (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
      }
    },
    []
  );

  // Reset to initial demo seed
  const resetToDefaults = useCallback(async () => {
    for (const y of INITIAL_YAKS) {
      try {
        await setDoc(doc(db, 'posts', y.id), y);
      } catch {}
    }
    setSavedIds([]);
    localStorage.removeItem(SAVED_KEY);
  }, []);

  // Compute Yakarma
  const yakarma = posts.reduce((acc, post) => {
    if (post.authorId === deviceId) {
      acc += post.score;
    }
    post.comments.forEach((c) => {
      if (c.authorId === deviceId) {
        acc += c.score;
      }
    });
    return acc;
  }, 25);

  return {
    isLoaded,
    deviceId,
    posts,
    savedIds,
    userProfile,
    yakarma,
    votePost,
    reportPost,
    votePoll,
    addPost,
    addComment,
    voteComment,
    toggleSave,
    deleteMyPost,
    resetToDefaults,
    setUserProfile: (prof: { alias: string; avatar: string }) => {
      setUserProfile(prof);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(prof));
    },
  };
}

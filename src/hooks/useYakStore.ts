import { useState, useEffect, useCallback } from 'react';
import { YakPost, YakComment, Poll } from '../types/yak';
import { INITIAL_YAKS, ANONYMOUS_AVATARS, ADJECTIVES } from '../data/initialYaks';

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

  // Initialize device & load data
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

    // Saved
    const storedSaved = localStorage.getItem(SAVED_KEY);
    if (storedSaved) {
      try {
        setSavedIds(JSON.parse(storedSaved));
      } catch {
        setSavedIds([]);
      }
    }

    // Posts
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (storedPosts) {
      try {
        const parsed = JSON.parse(storedPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
        } else {
          setPosts(INITIAL_YAKS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_YAKS));
        }
      } catch {
        setPosts(INITIAL_YAKS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_YAKS));
      }
    } else {
      setPosts(INITIAL_YAKS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_YAKS));
    }

    setIsLoaded(true);
  }, []);

  // Save posts to storage whenever updated
  const savePosts = useCallback((newPosts: YakPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, []);

  // Vote on a Yak post (+1 or -1, with -5 Community Standards Purge)
  const votePost = useCallback(
    (postId: string, direction: 'up' | 'down') => {
      const currentDevId = deviceId || getOrCreateDeviceId();

      setPosts((prevPosts) => {
        const updated = prevPosts.map((post) => {
          if (post.id !== postId) return post;

          const hasUpvoted = post.upvotes.includes(currentDevId);
          const hasDownvoted = post.downvotes.includes(currentDevId);

          let newUpvotes = [...post.upvotes];
          let newDownvotes = [...post.downvotes];

          if (direction === 'up') {
            if (hasUpvoted) {
              // Toggle off upvote
              newUpvotes = newUpvotes.filter((id) => id !== currentDevId);
            } else {
              // Add upvote & remove downvote if present
              newUpvotes.push(currentDevId);
              newDownvotes = newDownvotes.filter((id) => id !== currentDevId);
            }
          } else {
            // direction === 'down'
            if (hasDownvoted) {
              // Toggle off downvote
              newDownvotes = newDownvotes.filter((id) => id !== currentDevId);
            } else {
              // Add downvote & remove upvote if present
              newDownvotes.push(currentDevId);
              newUpvotes = newUpvotes.filter((id) => id !== currentDevId);
            }
          }

          const newScore = newUpvotes.length - newDownvotes.length;
          
          // Community Standards -5 rule: automatic removal
          const shouldRemove = newScore <= -5;
          const isRemoved = post.isRemoved || shouldRemove;
          const removeReason = shouldRemove
            ? 'Removed by community standards: Reached -5 downvotes from classmates.'
            : post.removeReason;

          return {
            ...post,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newScore,
            isRemoved,
            removeReason,
          };
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Save failed', e);
        }
        return updated;
      });
    },
    [deviceId]
  );

  // Report post for violating community standards
  const reportPost = useCallback(
    (postId: string, reason: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      setPosts((prev) => {
        const updated = prev.map((post) => {
          if (post.id !== postId) return post;
          if (post.reportedBy.includes(currentDevId)) return post;

          const newReportedBy = [...post.reportedBy, currentDevId];
          const newReportCount = newReportedBy.length;
          const shouldRemove = newReportCount >= 3;

          return {
            ...post,
            reportCount: newReportCount,
            reportedBy: newReportedBy,
            isRemoved: post.isRemoved || shouldRemove,
            removeReason: shouldRemove
              ? `Flagged by ${newReportCount} classmates for: ${reason}`
              : post.removeReason,
          };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [deviceId]
  );

  // Vote in an anonymous poll
  const votePoll = useCallback(
    (postId: string, optionId: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      setPosts((prev) => {
        const updated = prev.map((post) => {
          if (post.id !== postId || !post.poll) return post;

          const alreadyVoted = post.poll.options.some((opt) =>
            opt.votedUserIds?.includes(currentDevId)
          );
          if (alreadyVoted) return post;

          const newOptions = post.poll.options.map((opt) => {
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: opt.votes + 1,
                votedUserIds: [...(opt.votedUserIds || []), currentDevId],
              };
            }
            return opt;
          });

          return {
            ...post,
            poll: {
              ...post.poll,
              totalVotes: post.poll.totalVotes + 1,
              options: newOptions,
            },
          };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [deviceId]
  );

  // Add new anonymous post
  const addPost = useCallback(
    (data: {
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
        topicTag: data.topicTag,
        mood: data.mood,
        imageUrl: data.imageUrl,
        authorId: currentDevId,
        authorAlias: userProfile.alias,
        authorAvatar: userProfile.avatar,
        createdAt: new Date().toISOString(),
        score: 1, // Author starts with +1 initial vote
        upvotes: [currentDevId],
        downvotes: [],
        commentsCount: 0,
        comments: [],
        poll: pollData,
        reportCount: 0,
        reportedBy: [],
        isRemoved: false,
      };

      setPosts((prev) => {
        const next = [newPost, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      return newPost;
    },
    [deviceId, userProfile]
  );

  // Add comment to a post
  const addComment = useCallback(
    (postId: string, content: string, imageUrl?: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;

      const isOP = targetPost.authorId === currentDevId;
      const commentId = 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);

      // Determine alias: OP or unique pseudonym
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
        imageUrl,
        createdAt: new Date().toISOString(),
        score: 1,
        upvotes: [currentDevId],
        downvotes: [],
      };

      setPosts((prev) => {
        const updated = prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, newComment],
          };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [deviceId, posts, userProfile]
  );

  // Vote comment
  const voteComment = useCallback(
    (postId: string, commentId: string, direction: 'up' | 'down') => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      setPosts((prev) => {
        const updated = prev.map((post) => {
          if (post.id !== postId) return post;

          const updatedComments = post.comments.map((comment) => {
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

          return { ...post, comments: updatedComments };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [deviceId]
  );

  // Toggle bookmark / saved
  const toggleSave = useCallback((postId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Delete own post
  const deleteMyPost = useCallback(
    (postId: string) => {
      const currentDevId = deviceId || getOrCreateDeviceId();
      setPosts((prev) => {
        const updated = prev.filter((p) => !(p.id === postId && p.authorId === currentDevId));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [deviceId]
  );

  // Reset to initial demo seed
  const resetToDefaults = useCallback(() => {
    savePosts(INITIAL_YAKS);
    setSavedIds([]);
    localStorage.removeItem(SAVED_KEY);
  }, [savePosts]);

  // Compute Yakarma
  const yakarma = posts.reduce((acc, post) => {
    if (post.authorId === deviceId) {
      acc += post.score;
    }
    // and from comments authored by user
    post.comments.forEach((c) => {
      if (c.authorId === deviceId) {
        acc += c.score;
      }
    });
    return acc;
  }, 25); // base starter yakarma

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

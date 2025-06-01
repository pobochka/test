import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface Posts {
  id: string;
  title: string;
  views: number;
  topcomment: string;
  likes: number;
  [key: string]: any;
}

const Table: React.FC<{ reload: number }> = ({ reload }) => {
  const [posts, setPosts] = useState<Posts[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [hasMore, sethasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const limit: Number = 5;

  const fetchData = async (page: Number) => {
    if (loading) return; // Предотвращаем повторные запросы
    setLoading(true);

    try {
      //получение данных
      const res = await axios.get(`http://localhost:3001/posts`, {
        params: {
          _limit: limit,
          _page: page,
        },
      });

      //проверка на наличие новых постов для загрузки
      const nextPosts = res.data;
      if (nextPosts.length === 0) {
        sethasMore(false);
      }

      // Устанавливаем keys только один раз для первой страницы
      if (page === 1 && nextPosts.length > 0) {
        const allKeys = Object.keys(nextPosts[0]);
        const limitedKeys = allKeys.slice(0, 15); //ограничение на макс 15 полей

        if (limitedKeys.length < 5) {
          //ограничение на мин 5 полей
          setError("Error: количество полей меньше 5");
          setKeys([]);
          return;
        }

        setKeys(limitedKeys);
      }

      // Фильтруем дубликаты и добавляем только новые посты
      setPosts((prev) => {
        const existingIds = new Set(prev.map((post: Posts) => post.id));
        const newPosts = nextPosts.filter(
          (post: Posts) => !existingIds.has(post.id)
        );
        return [...prev, ...newPosts];
      });
    } catch (error: any) {
      setError("Error: количество полей меньше 5");
      sethasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    if (reload > 0) {
      setPosts([]);

      sethasMore(true);
      setLoading(false);
      setPage(1);
    }
  }, [reload]);

  //автоматическая подгрузка
  useEffect(() => {
    const checkAndLoadMore = () => {
      if (posts.length > 0 && hasMore && !loading) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Если высота документа меньше или равна высоте окна, подгружаем посты
        if (documentHeight <= windowHeight) {
          setPage((prev) => prev + 1);
        }
      }
    };
    // Проверяем через небольшую задержку, чтобы DOM успел обновиться
    const timer = setTimeout(checkAndLoadMore, 50);
    return () => clearTimeout(timer);
  }, [posts, hasMore, loading]);
  const moreData = () => {
    if (hasMore && !loading) {
      setTimeout(() => {
        setPage((prev) => prev + 1);
      }, 50);
    }
  };

  if (error) {
    return (
      <>
        <div style={{ color: "red" }}>{error}</div>
      </>
    );
  }

  return (
    <>
      <InfiniteScroll
        next={moreData}
        hasMore={hasMore}
        loader={<span>Loading⏳...</span>}
        dataLength={posts.length}
      >
        <div>
          <table className="table table-hover table align-middle">
            <thead>
              <tr>
                {keys.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  {keys.map((key) => (
                    <td
                      className="col-1"
                      style={{ overflowWrap: "break-word", maxWidth: "3rem" }}
                      key={key}
                    >
                      {post[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfiniteScroll>
    </>
  );
};

export default Table;

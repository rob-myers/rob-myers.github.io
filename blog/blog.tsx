import { useEffect } from 'react';
import Blog1 from './1/blog-1.mdx';
import Blog2 from './2/blog-2.mdx';
import { getWindow } from '@model/dom.model';
import css from './blog.scss';

const BlogRoot: React.FC = () => {
  useEffect(() => {
    if (getWindow()?.location.hash) {// Scroll to initial hash
      const found = Array.from(document.getElementsByTagName('a'))
        .find(el => el.name === window.location.hash.slice(1));
      found && setTimeout(() => window.scrollTo({ top: found.offsetTop }), 100);
    }
  }, []);

  return (
    <div className={css.root}>
      <Blog1/>
      <Blog2/>
    </div>
  );
};

export default BlogRoot;
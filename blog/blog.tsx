import { useEffect } from 'react';
import { getWindow } from '@model/dom.model';
import Blog1 from './1/blog-1.mdx';
import Blog2 from './2/blog-2.mdx';
import css from './blog.scss';

// TODO use scrollIntoView for all hash views
const BlogRoot: React.FC = () => {
  useEffect(() => {
    if (getWindow()?.location.hash) {// Scroll to initial hash
      const found = Array.from(document.getElementsByTagName('a'))
        .find(el => el.name === window.location.hash.slice(1));
      found && setTimeout(() => found.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
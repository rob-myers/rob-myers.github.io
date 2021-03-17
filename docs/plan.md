# Website objectives

We plan to create a website concerned with Game AI. We will provide an editor so scenarios can be created and experienced. Users of the website can create scenarios and save them as textual "comments". The website will be arranged as a blog e.g. concerned with a particular setting, or a particular Game AI technique. There will also be a general area where users can post ideas/scenarios unrelated to the blog posts.

## The editor

The editor consists of one or more `Terminal`s and a `Stage`.

### TODO

✅ `Terminal` can run background processes
✅ can read from stage key events via `key`
✅ list processes via `ps`
  > have pid, ppid, pgid, sid, truncated src
✅ can kill processes
✅ Represent newlines in history using single char `¶` rather than `$'\n'`
✅ can `read >data`
✅ can `while read >data do ... done` and `while sleep; do echo foo`
- can suspend processes

- force `while` to be guarded; add `break` and `continue`

- Can create ui plugin using shell, changing `SelectRect` on key events.

- Have layers where tagged multipolygons and blender models can be stored
- Can create walls

- Try building a low poly character in blender
- Beginners guide:
  - https://www.youtube.com/watch?v=7MRonzqYJgw&ab_channel=GrantAbbitt
  - https://www.youtube.com/watch?v=L0AY61v6-M4&ab_channel=GrantAbbitt
- Model: https://www.youtube.com/watch?v=4OUYOKGl7x0
- Rigging: https://www.youtube.com/watch?v=srpOeu9UUBU

- Start writing post / decide on blog format

- Implement comments using build and client-side calls:
  > https://eiriksm.dev/walkthrough-github-comments
- Must navigate to GitHub to actually post comments

- Create basic text editor using Prism shell highlighting,
  so can write functions and 'scripts'

### DONE

✅ have `Terminal`
✅ have `Stage`
✅ can use `Terminal` to create rectilinear polygons in `Stage`
✅ can create rectangular selection using mouse
✅ need setting/theme/story to bring it to life
   > We will remake Teleglitch on the web
✅ can `get /brush/sides`
✅ can `set /brush/sides 4`

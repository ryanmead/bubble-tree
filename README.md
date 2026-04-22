# bubble-tree
Quickly and easily turn a few boring nested `<ul>...</ul>` lists into an attractive, impactful, easily navigable site!

**bubble-tree** is ideal for presenting hierarchical data, such as social media landing pages, personal CVs, and placeholder sites. **bubble-tree** styles every `<li>` tag as a "bubble" (a circle with a semitransparent background) and arranges the bubbles to show the data hierarchy.
## Benefits
### Intuitive Navigation
Deeply nested information in a multi-level list tends to be less important or not necessarily of interest. **bubble-tree** scales down nested information until the user shows interest in it by clicking one of its parents.

Touching or clicking a bubble zooms in our out on the list so that the touched bubble fills the viewport or frame. This hides its parents and increases the size of its children.

To prevent unintended navigation, any offsite links a bubble contains are disabled when the bubble is very small. They become active when the user zooms in close enough.  
### Easy to deploy
If you can code a few nested `<ul>...</ul>` lists, you got this!
# How to deploy bubble-tree
Start with information arranged in a hierarchy (e.g. a multi-level bulleted list).
## 1. Code the list as nested HTML unordered lists (`<ul></ul>`)
Follow [best practices](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul#usage_notes) for making well-formed nested unordered lists. (Be sure to place each child `<ul>...</ul>` element inside an `<li></li>` tag of the parent list!) Give the opening `<ul>` tag of the top-level list the id "bubbleTree" as shown.
```
<ul id="bubbleTree">
  <li>
    <p>Parent node</p>
    <ul>
      <li>
        <p>Child node</p>
      </li>
      <li>
        <p>Another child node</p>
      </li>
    </ul>
  </li>
</ul>
```
## 2. Add bubble-tree.css
Add the file to your project and link to it in the `<head>` element of your html file or template.
```
<link rel="stylesheet" href="css/bubble-tree.css">
```
## 3. Add bubble-tree.js
Add the file to your project and link to it from your html file or template. 
```
<script src="js/bubble-tree.js"></script>
```
## 4. Add the top link
When zoomed in, a link for returning to the top appears in the top left. It disappears when touched.

Add `<a href="#" id="bubbleTopLink" class="hidden">` to your page to create this link.

## 5. Customize your site
Congratulations! Your site should be basically up and running. Now you're ready to customize it to make it your own.
### Portrait vs Landscape
Nested `<ul>` lists are displayed to the right of their parent `<li>` elements. They add width, but not height, to their parents.
At runtime, JavaScript sizes the list to fit the screen, regardless of the orientation of either.
Use one `<li>` element in your top-level `<ul>` list for a landscape orientation dominated by one large circle.
Use two or more `<li>` elements for a portrait orientation.

### Background Images
By default, background images are shown centered and scaled to cover the circle.

# Limitations
## Text meant to appear inside a circle can't go directly inside the `<li>` tag
The text needs to go inside a tag (such as P, H1, H2, etc.) that is a child of the `<li>` tag. Text placed directly inside the `<li>` tag will exceed the boundaries of its bubble.

## Maximum 5 items per list
This limitation is easily overcome by building out more CSS selectors. If you are so inclined, it should be obvious by looking at the source of `bubble-tree.css`.

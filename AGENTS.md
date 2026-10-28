<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- UI physical motion is opt-in on featured cards, while shared controls may use low-cost press feedback; avoid persistent blur/rotation so chess input and touch scrolling remain responsive.
- Bundled background/poster images are capped to real screen widths (phone 1080, iPad 1640, desktop 1920) as WebP q≈82; large originals live in the asset library — keeps page decode cost low on mobile.

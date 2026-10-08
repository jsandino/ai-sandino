// remark config: used only by `make linkcheck` (scripts/linkcheck.sh) to
// validate relative links and #heading anchors in the repo's Markdown.
import remarkValidateLinks from "remark-validate-links";

export default {
  plugins: [[remarkValidateLinks, { repository: false }]],
};

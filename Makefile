.PHONY: pdf clean

# Full PDF build: pre-render Mermaid diagrams, then compile the typeset PDF
# to public/harness-guide.pdf. (Named "pdf", not "build", so it isn't
# confused with the site build: npm run build.)
pdf:
	bash scripts/render-diagrams.sh
	bash scripts/build-pdf.sh

# Remove intermediate build output. Leaves public/harness-guide.pdf alone:
# it is a committed artifact, not scratch.
clean:
	rm -rf build

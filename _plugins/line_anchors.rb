# Jekyll plugin to inject per-line anchors into <pre class="line-numbers"><code> blocks
# It parses the generated HTML and replaces the code content with <span id="code-<n>-L<line>"> wrappers
# Requires Nokogiri (commonly available in Jekyll environments). If Nokogiri is missing, the plugin will safely skip.

begin
  require 'jekyll'
  require 'nokogiri'
rescue LoadError
  Jekyll.logger.warn "line_anchors:", "nokogiri not available; line anchors will not be generated. Install the 'nokogiri' gem to enable this plugin."
end

module Jekyll
  class LineAnchorsGenerator
    @@code_block_counter = 0

    def self.process_output(output)
      return output unless defined?(Nokogiri)
      doc = Nokogiri::HTML::DocumentFragment.parse(output)
      changed = false

      doc.css('pre.line-numbers').each do |pre|
        code = pre.at_css('code')
        next unless code

        text = code.text
        # Normalize line endings
        lines = text.gsub('\r\n', '\n').gsub('\r', '\n').split('\n')
        base = "code-#{@@code_block_counter}"
        @@code_block_counter += 1

        # Build new fragment: each line wrapped in a span with an id
        frag = Nokogiri::HTML::DocumentFragment.parse("")
        lines.each_with_index do |line, idx|
          line_num = idx + 1
          span = Nokogiri::XML::Node.new('span', doc)
          span['id'] = "#{base}-L#{line_num}"
          span['class'] = 'code-line'
          # preserve original content with escaped content
          span.content = line
          frag.add_child(span)
          # add a newline text node so lines remain separate
          frag.add_child(Nokogiri::XML::Text.new("\n", doc))
        end

        # Set an id on the code element for linking to the block
        code['id'] = base
        # Replace code inner HTML
        code.children.remove
        code.add_child(frag)
        changed = true
      end

      changed ? doc.to_html : output
    end
  end

  # Register hooks for pages and documents after rendering HTML
  Jekyll::Hooks.register [:pages, :documents, :posts], :post_render do |page|
    next unless page.output_ext == '.html' && page.output
    begin
      page.output = LineAnchorsGenerator.process_output(page.output)
    rescue => e
      Jekyll.logger.error 'line_anchors:', "failed to process #{page.path}: #{e.message}"
    end
  end
end

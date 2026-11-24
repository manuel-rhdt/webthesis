-- eq-number.lua – move equation numbers out of the math so CSS can place them.
--
-- Quarto's crossref filter numbers a display equation by appending ` \qquad(2.1)` to the TeX, so
-- in HTML the number ends up inside the equation (and, after formel, inside the SVG) where it can
-- only be centred with the formula. This filter runs after `quarto` in the filter list, strips
-- that suffix from the maths of every `<span id="eq-…">` and emits the number as its own
-- `<span class="eq-number">(2.1)</span>`. The wrapping span gets the class `eq-display`;
-- theme/equations.css then sets the number flush right in the content box.
--
-- HTML only: LaTeX/PDF output numbers equations natively and is left untouched.

if not FORMAT:match("html") then
  return {}
end

local function isDisplayMath(el)
  return el.t == "Math" and el.mathtype == "DisplayMath"
end

function Span(span)
  if not span.identifier:match("^eq%-") then
    return nil
  end

  local content = pandoc.List()
  local number = nil
  for _, inline in ipairs(span.content) do
    if isDisplayMath(inline) then
      local body, num = inline.text:match("^(.-)%s*\\qquad%s*%(([^()]*)%)%s*$")
      if num then
        number = num
        inline = pandoc.Math("DisplayMath", body)
      end
    end
    content:insert(inline)
  end

  if number == nil then
    return nil
  end

  content:insert(pandoc.Span({ pandoc.Str("(" .. number .. ")") }, pandoc.Attr("", { "eq-number" })))
  span.content = content
  span.classes:insert("eq-display")
  return span
end

/**
 * Equation Tooltip Display for Cross-References
 * Shows referenced equations in a tooltip when hovering over equation links
 */

(function() {
    'use strict';

    let currentTooltip = null;
    let currentHighlightedElement = null;

    /**
     * Adjust tooltip position to keep it within viewport bounds
     */
    function adjustTooltipPosition(tooltip) {
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust horizontal position if tooltip goes off right edge
        if (rect.right > viewportWidth - 10) {
            tooltip.style.left = (viewportWidth - rect.width - 10) + 'px';
        }

        // Adjust horizontal position if tooltip goes off left edge
        if (rect.left < 10) {
            tooltip.style.left = '10px';
        }

        // If tooltip goes off bottom, position it above the link instead
        if (rect.bottom > viewportHeight - 10) {
            const linkRect = tooltip._linkRect;
            tooltip.style.top = (linkRect.top - rect.height - 5) + 'px';
        }

        // Adjust vertical position if still off-screen
        if (rect.top < 10) {
            tooltip.style.top = '10px';
        }
    }

    /**
     * Check if an element is visible in the viewport
     */
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Highlight an equation (persists during hover)
     */
    function highlightEquation(targetDiv) {
        // Remove previous highlight if any
        removeHighlight();

        // Add highlight class
        targetDiv.classList.add('equation-highlighted');

        // Track the currently highlighted element
        currentHighlightedElement = targetDiv;
    }

    /**
     * Remove highlight from equation
     */
    function removeHighlight() {
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('equation-highlighted');
            currentHighlightedElement = null;
        }
    }

    /**
     * Create and show tooltip for an equation reference, or highlight if visible
     */
    function showTooltip(link, event) {
        // Remove any existing tooltip
        hideTooltip();

        const targetId = link.getAttribute('href').substring(1); // Remove #
        const targetDiv = document.getElementById(targetId);

        if (!targetDiv) return;

        // Check if the equation is currently visible in viewport
        if (isElementInViewport(targetDiv)) {
            // Equation is visible - highlight it instead of showing tooltip
            highlightEquation(targetDiv);
            return;
        }

        // Equation is not visible - show tooltip
        const mathEl = targetDiv.querySelector('math');
        if (!mathEl) return;

        // Create tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'equation-tooltip';

        // Clone the math element
        const mathClone = mathEl.cloneNode(true);
        tooltip.appendChild(mathClone);

        // Position tooltip below the link
        const rect = link.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';

        // Store link rect for potential repositioning
        tooltip._linkRect = rect;

        // Add to DOM
        document.body.appendChild(tooltip);

        // Adjust position if off-screen
        setTimeout(() => adjustTooltipPosition(tooltip), 10);

        currentTooltip = tooltip;
    }

    /**
     * Hide and remove the current tooltip and highlights
     */
    function hideTooltip() {
        if (currentTooltip) {
            currentTooltip.remove();
            currentTooltip = null;
        }
        removeHighlight();
    }

    /**
     * Initialize tooltip functionality
     */
    function initTooltips() {
        // Find all equation reference links
        const eqLinks = document.querySelectorAll('a[href^="#eq:"]');

        eqLinks.forEach(link => {
            // Show tooltip on mouse enter
            link.addEventListener('mouseenter', function(e) {
                showTooltip(this, e);
            });

            // Hide tooltip on mouse leave
            link.addEventListener('mouseleave', function(e) {
                hideTooltip();
            });

            // Also hide tooltip when link is clicked (navigating to equation)
            link.addEventListener('click', function(e) {
                hideTooltip();
            });
        });

        // Hide tooltip on scroll (prevents misalignment)
        window.addEventListener('scroll', hideTooltip);

        // Hide tooltip on window resize
        window.addEventListener('resize', hideTooltip);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
        initTooltips();
    }
})();

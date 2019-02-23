/* Difference in large floating point numbers - C# app will round up the last 4 digits. This may become a problem later on 

    Ex: 1115815936 becomes 1115816000 (SETG -> madden_3-4 test)
*/

// addScrollListenerToElement: function (element) {
    //   let lastKnownScrollPosition = 0;
    //   let ticking = false;

    //   element.addEventListener('scroll', function () {
    //     lastKnownScrollPosition = element.scrollLeft;
        
    //     if (!ticking) {
    //       window.requestAnimationFrame(function () {
    //         this.computeHeaderTabOverflow();
    //         ticking = false;
    //       }.bind(this));
    //     }

    //     ticking = true;
    //   }.bind(this));
    // },

    // computeHeaderTabOverflow: function () {
    //   /* credit to https://benfrain.com/a-horizontal-scrolling-navigation-pattern-for-touch-and-mouse-with-moving-current-indicator/ */
    //   const wrapperMetrics = getMetricsFromElement(this.$refs.headerTabWrapper);
    //   const contentMetrics = getMetricsFromElement(this.$refs.headerTabContent);

    //   if (wrapperMetrics.left > contentMetrics.left && wrapperMetrics.right < contentMetrics.right) {
    //     return 'both';
    //   }
    //   else if (contentMetrics.left < wrapperMetrics.left) {
    //     return 'left';
    //   }
    //   else if (contentMetrics.right > wrapperMetrics.right) {
    //     return 'right'
    //   }
    //   else {
    //     return 'none';
    //   }

    //   function getMetricsFromElement(element) {
    //     const metrics = element.getBoundingClientRect();

    //     return {
    //       'metrics': metrics,
    //       'right': Math.floor(metrics.right),
    //       'left': Math.floor(metrics.left)
    //     }
    //   }
    // }

    /*<div class="filter-table-main">
          <span class="table-header">Condition</span>
          <span class="table-header">Table</span>
          <span class="table-header">Active</span>
          <span class="table-header">Delete</span>
          <div class="table-content condition">
            <input class="field" value="SETP" />
            <select class="operator" value="<">
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="=">=</option>
              <option value="!=">!=</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
            </select>
            <input class="value" value="30" />
          </div>
          <div class="table-content table">
            <select class="table-select" value="All Tables">
              <option value="SETP">SETP</option>
              <option value="SPKG">SPKG</option>
              <option value="SGFM">SGFM</option>
              <option value="PLYS">PLYS</option>
              <option value="All Tables">All Tables</option>
            </select>
          </div>
          <div class="table-content">
            <input type="checkbox" name="table" />
          </div>
          <div class="table-content">
            <button class="trash"></button>
          </div>
          <div class="table-content condition">
            <input class="field" value="name"/>
            <select class="operator" value="contains">
              <option value="contains">contains</option>
              <option value="!contains">!contains</option>
              <option value="=">=</option>
              <option value="!=">!=</option>
              <option value="startsWith">starts with</option>
              <option value="ends with">ends with</option>
            </select>
            <input class="value" value="Kickoff Mid"/>
          </div>
          <div class="table-content table">
            <select class="table-select" value="PLYS">
              <option value="SETP">SETP</option>
              <option value="SPKG">SPKG</option>
              <option value="SGFM">SGFM</option>
              <option value="PLYS">PLYS</option>
              <option value="All Tables">All Tables</option>
            </select>
          </div>
          <div class="table-content">
            <input type="checkbox" name="table" checked />
          </div>
          <div class="table-content">
            <button class="trash"></button>
          </div>
        </div> */

        /*  .filter-table-main {
    display: grid;
    grid-template-columns: 1fr 1fr 0.5fr 0.5fr;
    grid-template-rows: 1fr 1fr;
    grid-gap: 5px;

    @media(min-width: $breakpoint-lg) {
      grid-template-columns: 3fr 1.5fr 0.5fr 0.5fr;
      grid-template-rows: 1fr;
      grid-gap: 15px;
    }

    .table-header {
      display: none;

      @media(min-width: $breakpoint-lg) {
        display: initial;
      }
    }

    .table-content {
      @media(max-width: $breakpoint-lg) {
        &:nth-of-type(5n) {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid $filter-text-color;
        }
      }
    }

    .condition {
      display: inline-grid;
      grid-template-columns: minmax(100px, 1fr) minmax(100px, 0.5fr) minmax(100px, 1fr);
      grid-column-gap: 5px;

      grid-column: 1 / 5;

      @media(min-width: $breakpoint-lg) {
        grid-column-gap: 10px;
        grid-column: auto;
      }

      > input {
        border: none;
        background: transparent;
        color: $filter-text-color;
        padding: 5px;

        &:hover {
          background-color: darken($modal-background-color, 10%);
        }
      }
    }

    select {
      background: transparent;
      border: none;
      color: $filter-text-color;
      -webkit-appearance: menulist-text;
      height: 100%;
      width: 100%;

      &:hover {
        -webkit-appearance: menulist;
      }

      option {
        background-color: $modal-background-color;
      }
    }

    input[type=checkbox] {
      -webkit-appearance: none;
      height: 100%;
      width: 26px;
      border: 1px solid $filter-text-color;
      margin: 0;

      &:checked {
        &:after {
          height: calc(100% - 8px);
          width: calc(100% - 8px);
          background-color: orange;
          content: " ";
          display: block;
          margin: 4px;
        }
      }
    }

    .trash {
      height: 100%;
      width: 100%;
      display: block;
      background-image: url('data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4Ni40IDQ4Ni40IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODYuNCA0ODYuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQ0Niw3MEgzNDQuOFY1My41YzAtMjkuNS0yNC01My41LTUzLjUtNTMuNWgtOTYuMmMtMjkuNSwwLTUzLjUsMjQtNTMuNSw1My41VjcwSDQwLjRjLTcuNSwwLTEzLjUsNi0xMy41LDEzLjUgICAgUzMyLjksOTcsNDAuNCw5N2gyNC40djMxNy4yYzAsMzkuOCwzMi40LDcyLjIsNzIuMiw3Mi4yaDIxMi40YzM5LjgsMCw3Mi4yLTMyLjQsNzIuMi03Mi4yVjk3SDQ0NmM3LjUsMCwxMy41LTYsMTMuNS0xMy41ICAgIFM0NTMuNSw3MCw0NDYsNzB6IE0xNjguNiw1My41YzAtMTQuNiwxMS45LTI2LjUsMjYuNS0yNi41aDk2LjJjMTQuNiwwLDI2LjUsMTEuOSwyNi41LDI2LjVWNzBIMTY4LjZWNTMuNXogTTM5NC42LDQxNC4yICAgIGMwLDI0LjktMjAuMyw0NS4yLTQ1LjIsNDUuMkgxMzdjLTI0LjksMC00NS4yLTIwLjMtNDUuMi00NS4yVjk3aDMwMi45djMxNy4ySDM5NC42eiIgZmlsbD0iI0ZGRkZGRiIvPgoJCTxwYXRoIGQ9Ik0yNDMuMiw0MTFjNy41LDAsMTMuNS02LDEzLjUtMTMuNVYxNTguOWMwLTcuNS02LTEzLjUtMTMuNS0xMy41cy0xMy41LDYtMTMuNSwxMy41djIzOC41ICAgIEMyMjkuNyw0MDQuOSwyMzUuNyw0MTEsMjQzLjIsNDExeiIgZmlsbD0iI0ZGRkZGRiIvPgoJCTxwYXRoIGQ9Ik0xNTUuMSwzOTYuMWM3LjUsMCwxMy41LTYsMTMuNS0xMy41VjE3My43YzAtNy41LTYtMTMuNS0xMy41LTEzLjVzLTEzLjUsNi0xMy41LDEzLjV2MjA4LjkgICAgQzE0MS42LDM5MC4xLDE0Ny43LDM5Ni4xLDE1NS4xLDM5Ni4xeiIgZmlsbD0iI0ZGRkZGRiIvPgoJCTxwYXRoIGQ9Ik0zMzEuMywzOTYuMWM3LjUsMCwxMy41LTYsMTMuNS0xMy41VjE3My43YzAtNy41LTYtMTMuNS0xMy41LTEzLjVzLTEzLjUsNi0xMy41LDEzLjV2MjA4LjkgICAgQzMxNy44LDM5MC4xLDMyMy44LDM5Ni4xLDMzMS4zLDM5Ni4xeiIgZmlsbD0iI0ZGRkZGRiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=');
      // <div>Icons made by <a href="https://www.flaticon.com/authors/gregor-cresnar" title="Gregor Cresnar">Gregor Cresnar</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
      background-size: contain;
      background-repeat: no-repeat;
      background-color: transparent;
      cursor: pointer;
      border: none;
    }
  } */
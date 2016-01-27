/*
 * dependencies: jquery, backbonejs, underscorejs, window.sliMpd.router
 */
(function() {
    "use strict";
    
    var $ = window.jQuery,
        _ = window._;
    window.sliMpd = $.extend(true, window.sliMpd, {
        modules : {}
    });
    window.sliMpd.modules.AbstractView = window.Backbone.View.extend({

        rendered : false,

        initialize : function(options) {
            window.Backbone.View.prototype.initialize.call(this, options);
            _.bindAll.apply(_, [this].concat(_.functions(this)));
        },

        render : function() {
        	// only render page once (to prevent multiple click listeners)
            if (this.rendered) {
                return;
            }
            
            $('a.ajax-link', this.$el).on('click', this.genericClickListener);
            $('.player-ctrl', this.$el).on('click', this.playerCtrlClickListener);
            
            // TODO : use modal view!
			$('.trigger-modal', this.$el).on('click', function (e) {
		        e.preventDefault();
		        $.ajax({
					url: $(this).attr('data-href')
				}).done(function(response){
					$('#global-modal .modal-content').html(response);
					$('#global-modal').modal('show');
				});
		    });
		    // TODO : use modal view!
		    
		    $('.dropdown-toggle', this.$el).dropdown();
		    $('.toggle-tooltip', this.$el).tooltip();
  			$('[data-toggle="popover"]', this.$el).popover();
		    
		    /* route /maintainance/albumdebug */
		    $('.inline-tab-nav a', this.$el).click(function (e) {
		        e.preventDefault();
		        $(this).tab('show');
		    });
		    $('.grid', this.$el).sortable({
		        tolerance: 'pointer',
		        revert: 'invalid',
		        placeholder: 'span2 well placeholder tile',
		        forceHelperSize: true
		    });
		    
		    /* display selected value in dropdown instead of dropdown-label */
		    $('.dropdown', this.$el).each(function(index, item){
		    	$(item).find('.btn:first-child').html($('*[data-sortkey="'+ $(item).attr('data-activesorting')+'"]').html());
		    });
            
            window.Backbone.View.prototype.render.call(this);
            this.rendered = true;
        },
        
        remove : function() {
            $('a.ajax-link', this.$el).off('click', this.genericClickListener);
            $('.player-ctrl', this.$el).off('click', this.playerCtrlClickListener);
            
            window.Backbone.View.prototype.remove.call(this);
        },
        
        genericClickListener : function(e) {
            e.preventDefault();
        	var $el = $(e.currentTarget);
            window.sliMpd.router.navigate($el.attr('href'), {
                trigger : true
            });
        },
        
        playerCtrlClickListener : function(e) {
            e.preventDefault();
        	var $el = $(e.currentTarget);
        	
        	if(typeof $el.attr('data-player') == 'undefined') {
        		console.log('ERROR: missing player-item. exiting...');
        		return;
        	}
			try {
		        var item = JSON.parse($el.attr('data-player'));
		        console.log(item);
		        window.sliMpd.currentPlayer.process(item);
		    } catch(e) {
		    	console.log(e + ' in data-player attribute');
		    }
       },
        
        process : function(e) {
           // 
        },
        
    });
    
})();
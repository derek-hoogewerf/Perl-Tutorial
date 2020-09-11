
Vue.component( 'upload-field', {
    template: '#upload-field',
    props: {
        name: {
            required: true
        },
        value: {
            required: true
        },
        disabled: {
            type: 'boolean',
            default: false
        },
    },
    data: function () {
        return { };
    },
    methods: {
        uploadFile: function (event) {
            var form = new FormData();
            form.append( 'upload', event.target.files[0] );
            $.ajax( {
                method: 'POST',
                url: location.pathname + '/upload',
                data: form,
                processData: false,
                contentType: false,
                context: this
            } )
            .then(
                function ( data ) {
                    this.$emit( 'input', data );
                }
            );
        },
    }
} );

Vue.component( 'foreign-key-field', {
    template: '#foreign-key-field',
    props: {
        name: {
            required: true
        },
        value: {
            required: true
        },
        schemaName: {
            required: true
        },
        displayField: { },
        valueField: { },
        disabled: {
            type: 'boolean',
            default: false
        },
    },
    data: function () {
        // XXX Replace with VueX
        var schema = Yancy.schema[ this.schemaName ].operations.set.schema;
        var data = {
            _value: this.$props.value,
            displayValue: 'Loading...',
            loading: true,
            uid: 'fk-' + this.$props.name + '-' + Math.floor( Math.random() * 10000 ),
            searchQuery: '',
            searchResults: [
            ],
            displayField: this.$props.displayField,
            valueField: this.$props.valueField || schema['x-id-field'] || 'id'
        };

        if ( data.displayField ) {
            if ( typeof data.displayField == 'object' && data.displayField.template ) {
                data.displayTemplate = data.displayField.template;
            }
        }
        else {
            var schemaCols = schema['x-list-columns'];
            if ( schemaCols && typeof schemaCols[0] == 'object' ) {
                data.displayTemplate = schemaCols[0].template;
            }
            else if ( schemaCols ) {
                data.displayField = schemaCols[0];
            }
            else {
                data.displayField = schema['x-id-field'] || 'id';
            }
        }

        return data;
    },
    mounted: function () {
        var dropdownToggleEl = $( '#' + this.uid + ' .dropdown-toggle' );
        dropdownToggleEl.dropdown({
            boundary: 'viewport',
        });
        dropdownToggleEl.parent().on( 'shown.bs.dropdown', function (ev) {
            var input = $( ev.target ).find( 'input[type=text]' );
            // Without this setTimeout, the screen jumps significantly
            // when focusing the first time (when the dropdown is
            // initially created)
            setTimeout( function () { input.focus() }, 10 );
        } );
        this.fetchDisplayValue();
    },
    beforeDestroy: function () {
        var dropdownToggleEl = $( '#' + this.uid + ' .dropdown-toggle' );
        dropdownToggleEl.parent().off( 'shown.bs.dropdown' );
    },
    methods: {
        fetchDisplayValue: function () {
            if ( !this.$data._value ) {
                this.displayValue = '(none)';
                this.loading = false;
                return;
            }
            this.loading = true;
            $.ajax({
                method: 'GET',
                url: specUrl + '/' + this.$props.schemaName + '/' + this.$data._value,
                context: this
            })
            .then( this.updateDisplayValue );
        },
        displayItem: function ( item ) {
            return this.$data.displayTemplate
                ? Yancy.fillTemplate( this.$data.displayTemplate, item )
                : item[ this.$data.displayField ];
        },
        updateDisplayValue: function ( item ) {
            this.displayValue = this.displayItem( item );
            this.loading = false;
        },
        showDropdown: function () {
            var dropdownEl = $( '#' + this.uid );
            dropdownEl.find( '.dropdown-toggle' ).dropdown('toggle');
        },
        submitSearch: function () {
            var query = this.searchQuery,
                url = specUrl + '/' + this.$props.schemaName + '?$match=any';
            if ( this.$data.displayTemplate ) {
                var match = this.$data.displayTemplate.match( /\{[^}]+\}/g );
                match.forEach( function (field) {
                    url += '&' + field.replace(/[{}]/g, '') + '=' + encodeURIComponent( query );
                } );
            }
            else {
                url += '&' + this.$data.displayField + '=' + encodeURIComponent( query );
            }
            $.ajax({
                method: 'GET',
                url: url,
                context: this
            })
            .then( this.updateSearchResults );
        },
        updateSearchResults: function ( data ) {
            var results = [];
            for ( var i = 0; i < data.items.length; i++ ) {
                results.push({
                    display: this.displayItem( data.items[i] ),
                    value: data.items[i][ this.$data.valueField ]
                });
            }
            this.searchResults = results;
            this.$nextTick( function () {
                $( '#' + this.uid + ' .dropdown-toggle' ).dropdown('update');
            } );
        },
        select: function (item) {
            this.$data._value = item.value;
            this.$emit( 'input', item.value );
            this.displayValue = item.display;
            this.searchResults = [];
            this.searchQuery = '';
            $( '#' + this.uid ).find( '.dropdown-toggle' ).dropdown('hide');
            this.fetchDisplayValue();
        }
    }
} );

Vue.component('edit-field', {
    template: '#edit-field',
    props: {
        name: {
            required: true
        },
        value: {
            required: true
        },
        schema: {
            type: 'object',
            required: true
        },
        required: {
            type: 'boolean',
            default: false
        },
        valid: {
            type: 'boolean',
            default: true
        },
        example: { }
    },
    data: function () {
        var schemaType, fieldType = 'text', inputMode = 'text', children = [],
            pattern = this.schema.pattern, value = this.value;

        if ( Array.isArray( this.schema.type ) ) {
            schemaType = this.schema.type[0];
        }
        else {
            schemaType = this.schema.type;
        }

        if ( this.schema['x-foreign-key'] ) {
            fieldType = 'foreign-key';
        }
        else if ( this.schema['enum'] ) {
            fieldType = 'select';
        }
        else if ( schemaType == 'boolean' ) {
            fieldType = 'checkbox';
        }
        else if ( schemaType == 'string' ) {
            if ( this.schema.format == 'textarea' ) {
                fieldType = 'textarea';
            }
            else if ( this.schema.format == 'email' ) {
                fieldType = 'email';
                inputMode = 'email';
            }
            else if ( this.schema.format == 'url' ) {
                fieldType = 'url';
                inputMode = 'url';
            }
            else if ( this.schema.format == 'tel' ) {
                fieldType = 'tel';
                inputMode = 'tel';
            }
            else if ( this.schema.format == 'password' ) {
                fieldType = 'password';
            }
            else if ( this.schema.format == 'date' ) {
                fieldType = 'date';
            }
            else if ( this.schema.format == 'date-time' ) {
                fieldType = 'datetime-local';
                // Value must contain T, not space
                value = value.replace( / /, 'T' );
                // Verify the value lacks seconds, since datetime-local
                // fields do not support seconds...
                value = value.replace( /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}).*/, '$1' );
            }
            else if ( this.schema.format == 'markdown' ) {
                fieldType = 'markdown';
            }
            else if ( this.schema.format == 'filepath' ) {
                fieldType = 'file';
            }
        }
        else if ( schemaType == 'integer' || schemaType == 'number' ) {
            fieldType = 'number';
            inputMode = 'decimal';
            if ( schemaType == 'integer' ) {
                // Use pattern to show numeric input on iOS
                // https://css-tricks.com/finger-friendly-numerical-inputs-with-inputmode/
                pattern = this.schema.pattern || '[0-9]*';
                inputMode = 'numeric';
            }
        }
        else if (schemaType == 'array') {
            fieldType = 'array';
            children = (value || []).map(function (v, ix) {
              return ({
                name: this.name + "-"+ix,
                example: this.schema.items.example,
                required: false, valid: this.valid,
                schema: this.schema.items,
                value: v
              })}, this);
        }
        return {
            fieldType: fieldType,
            pattern: pattern,
            minlength: this.schema.minLength,
            maxlength: this.schema.maxLength,
            min: this.schema.minimum,
            max: this.schema.maximum,
            readonly: this.schema.readOnly,
            writeonly: this.schema.writeOnly,
            inputMode: inputMode,
            _value: value,
            showHtml: false,
            children: children
        };
    },
    methods: {
        input: function () {
            var value = this.$data._value;
            if ( this.children.length ) {
                value = this.children.map(function(e){return e.value;}).filter(function(e){return e;});
            }
            else if ( this.$data.fieldType == 'datetime-local' ) {
                value += ':00';
            }
            this.$emit( 'input', value );
        },
        addChild: function () {
            this.children.push({
                name: this.name + "-"+(this.children.length+1),
                example: this.schema.items.example,
                required: false, valid: true,
                schema: this.schema.items
              });
        },
        removeChild: function (ix) {
            this.children.splice(ix,1);
        }
    },
    computed: {
        html: function () {
            return this.$data._value
                ? marked(this.$data._value, { sanitize: false })
                : '';
        }
    },
    watch: {
        value: function () {
            this.$data._value = this.value;
        },
        children: function() {
            this.value = this.children.map(function(e){return e.value;}).filter(function(e){return e;});
            this.$emit('input', this.value);
        }
    }
});

Vue.component('item-form', {
    template: '#item-form',
    props: {
        item: {
            type: 'object',
            required: true
        },
        schema: {
            type: 'object',
            required: true
        },
        value: {
            required: true
        },
        showReadOnly: {
            required: false,
            default: true
        },
        error: {
            default: { }
        }
    },
    data: function () {
        return {
            _value: this.value ? JSON.parse( JSON.stringify( this.value ) ) : this.value,
            showRaw: false,
            rawValue: null,
            rawError: null
        };
    },
    methods: {
        save: function () {
            if ( this.showRaw && this.rawError ) { return; }
            this.$emit( 'input', this.$data._value );
            this.$data._value = JSON.parse( JSON.stringify( this.$data._value ) );
        },

        _isEqual: function ( left, right ) {
            var fields = new Set( Object.keys( left ).concat( Object.keys( right ) ) );
            var isEqual = true;
            fields.forEach(function ( key ) {
                if ( !isEqual ) return;
                isEqual = ( left[ key ] == right[ key ] );
            });
            return isEqual;
        },

        cancel: function () {
            if ( !this._isEqual( this.$data._value, this.value ) ) {
                if ( !confirm( 'Changes will be lost' ) ) {
                    return;
                }
            }
            this.$data._value = JSON.parse( JSON.stringify( this.value ) );
            this.$emit( 'close' );
        },

        updateRaw: function () {
            this.rawError = null;
            try {
                this.$data._value = JSON.parse( this.rawValue );
            }
            catch (e) {
                this.rawError = e;
            }
        },

        isRequired: function ( field ) {
            return this.schema.required && this.schema.required.indexOf( field ) >= 0;
        }
    },
    computed: {
        properties: function () {
            var props = [], schema = this.schema;
            for ( var key in schema.properties ) {
                var prop = schema.properties[ key ];
                var defaults = { name: key };
                if ( prop[ 'x-hidden' ] || ( prop['readOnly'] && !this.showReadOnly ) ) {
                    continue;
                }
                if ( typeof prop['x-order'] == 'undefined' ) {
                    defaults['x-order'] = 999999;
                }
                if ( !prop.title ) {
                    defaults.title = key;
                }
                props.push( Object.assign( defaults, prop ) );
            }
            return props.sort( function (a, b) {
                return a['x-order'] < b['x-order'] ? -1
                    : a['x-order'] > b['x-order'] ?  1
                    : a.name < b.name ? -1
                    : a.name > b.name ? 1
                    : 0;
            } );
        },
        example: function () {
            return this.schema.example || {};
        }
    },
    watch: {
        value: function () {
            this.$data._value = JSON.parse( JSON.stringify( this.value ) );
        },
        showRaw: function () {
            this.rawError = null;
            this.rawValue = JSON.stringify( this.$data._value, null, 4 );
        }
    }
});

var app = window.Yancy = new Vue({
    el: '#app',
    data: function () {
        var current = this.parseHash();
        return {
            hasSchema: null,
            currentSchemaName: current.schema || null,
            currentComponent: null,
            schema: {},
            openedRow: null,
            deleteIndex: null,
            addingItem: false,
            newItem: {},
            items: [],
            columns: [],
            total: 0,
            currentPage: ( current.page ? parseInt( current.page ) : 1 ),
            perPage: 25,
            fetching: false,
            error: {},
            formError: {},
            info: {},
            sortColumn: null,
            sortDirection: 1,
            newFilter: null,
            filters: [],
            toasts: []
        }
    },
    methods: {
        toggleRow: function ( i ) {
            if ( typeof i == 'undefined' || this.openedRow == i ) {
                this.$set( this, 'error', {} );
                this.$set( this, 'formError', {} );
                this.openedRow = null;
                this.openedOldValue = null;
            }
            else {
                this.addingItem = false;
                this.openedRow = i;
                this.openedOldValue = JSON.parse( JSON.stringify( this.items[i] ) );
            }
        },

        sortClass: function ( col ) {
            return this.sortColumn != col.field ? 'fa-sort'
                : this.sortDirection > 0 ? 'fa-sort-asc'
                : 'fa-sort-desc';
        },

        toggleSort: function ( col ) {
            if ( this.sortColumn == col.field ) {
                this.sortDirection = this.sortDirection > 0 ? -1 : 1;
            }
            else {
                this.sortColumn = col.field;
                this.sortDirection = 1;
            }
            this.currentPage = 1;
            this.fetchPage();
        },

        createFilter: function () {
            this.newFilter = {};
        },

        addFilter: function () {
            this.filters.push( this.newFilter );
            this.cancelFilter();
            this.fetchPage();
        },

        cancelFilter: function () {
            this.newFilter = null;
        },

        removeFilter: function ( i ) {
            this.filters.splice( i, 1 );
            this.fetchPage();
        },

        setSchema: function ( name ) {
            this.currentSchemaName = name;
            this.currentComponent = null;
            $( '#sidebar-collapse' ).collapse('hide');
        },

        setComponent: function ( name ) {
            this.currentComponent = name;
        },

        fetchSpec: function () {
            var self = this;
            delete self.error.fetchSpec;
            $.get( specUrl ).done( function ( data, status, jqXHR ) {
                self.parseSpec( data );
            } ).fail( function ( jqXHR, textStatus, errorThrown ) {
                self.$set( self.error, 'fetchSpec', errorThrown );
            } );
        },

        parseSpec: function ( spec ) {
            var pathParts = [], schemaName, schema, pathObj, firstSchema;
            this.schema = {};
            this.hasSchema = false;

            // Preprocess definitions
            for ( var defKey in spec.definitions ) {
                var definition = spec.definitions[ defKey ];
                if ( definition.type != 'object' ) {
                    continue;
                }
                if ( !definition.properties ) {
                    continue;
                }

                // Hide any HTML columns linked to Markdown columns
                for ( var propKey in definition.properties ) {
                    var prop = definition.properties[ propKey ];
                    if ( prop[ 'x-html-field' ] && definition.properties[ prop['x-html-field'] ] ) {
                        definition.properties[ prop['x-html-field' ] ][ 'x-hidden' ] = true;
                    }
                }

                // Create some kind of column list
                if ( !definition[ 'x-list-columns' ] && definition.properties ) {
                    definition[ 'x-list-columns' ] = Object.keys( definition.properties ).filter(
                        function (x) {
                            var prop = definition.properties[x];
                            if ( prop['x-hidden'] ) { return; }
                            // Do not allow binary or base64 (byte) fields
                            if ( prop.format ) {
                                return prop.format != "binary" && prop.format != "byte";
                            }
                            return true;
                        }
                    ).sort( function (a, b) {
                        return definition.properties[a]['x-order'] - definition.properties[b]['x-order']
                            || ( a > b ? 1 : a < b ? -1 : 0 );
                    } );
                }

            }

            for ( var pathKey in spec.paths ) {
                pathObj = spec.paths[ pathKey ];

                pathParts = pathKey.split( '/' );
                schemaName = pathParts[1];

                // Skip hidden schemas
                if ( spec.definitions[ schemaName ]['x-hidden'] ) {
                    continue;
                }

                schema = this.schema[ schemaName ];
                if ( !schema ) {
                    schema = this.schema[ schemaName ] = {
                        operations: { }
                    };
                }
                if ( !firstSchema ) {
                    firstSchema = schemaName;
                }
                this.hasSchema = true;

                // Array operations
                if ( pathParts.length == 2 ) {
                    if ( pathObj.get ) {
                        schema.operations["list"] = {
                            url: [ spec.basePath, pathKey ].join(''),
                            schema: spec.definitions[ schemaName ]
                        };
                    }
                    if ( pathObj.post ) {
                        schema.operations["add"] = {
                            url: [ spec.basePath, pathKey ].join(''),
                            schema: spec.definitions[ schemaName ]
                        };
                    }
                }
                // Item operations
                else {
                    if ( pathObj.get ) {
                        schema.operations["get"] = {
                            url: [ spec.basePath, pathKey ].join(''),
                            schema: spec.definitions[ schemaName ]
                        };
                    }
                    if ( pathObj.put ) {
                        schema.operations["set"] = {
                            url: [ spec.basePath, pathKey ].join(''),
                            schema: spec.definitions[ schemaName ]
                        };
                    }
                    if ( pathObj.delete ) {
                        schema.operations["delete"] = {
                            url: [ spec.basePath, pathKey ].join(''),
                            schema: spec.definitions[ schemaName ]
                        };
                    }
                }
            }

            if ( this.currentSchemaName && this.schema[ this.currentSchemaName ] ) {
                this.fetchPage();
            }
            else {
                this.currentSchemaName = firstSchema;
            }
        },

        fetchPage: function () {
            if ( this.fetching ) return;
            var self = this,
                query = {
                    $limit: this.perPage,
                    $offset: this.perPage * ( this.currentPage - 1 )
                };

            if ( this.sortColumn != null ) {
                var dir = this.sortDirection > 0 ? 'asc' : 'desc';
                query.$order_by = [ dir, this.sortColumn ].join( ':' );
            }
            for ( var i = 0; i < this.filters.length; i++ ) {
                query[ this.filters[i].field ] = this.filters[i].value;
            }

            this.fetching = true;
            delete this.error.fetchPage;
            $.get( this.currentOperations["list"].url, query ).done(
                function ( data, status, jqXHR ) {
                    if ( query.offset > data.total ) {
                        // We somehow got to a page that doesn't exist,
                        // so go to the first page instead
                        self.fetching = false;
                        self.currentPage = 1;
                        self.fetchPage();
                        return;
                    }

                    self.items = data.items;
                    self.total = data.total;
                    self.columns = self.getListColumns( self.currentSchemaName ),
                    self.fetching = false;
                    self.updateHash();
                }
            ).fail(
                function ( jqXHR, textStatus, errorThrown ) {
                    self.$set( self.error, 'fetchPage', errorThrown );
                }
            );
        },

        getListColumns: function ( schemaName ) {
            var schema = this.schema[ schemaName ].operations["list"].schema,
                props = schema.properties,
                columns = schema['x-list-columns'] || [];
            return columns.map( function (c) {
                if ( typeof c == 'string' ) {
                    return { title: props[ c ].title || c, field: c };
                }
                return c;
            } );
        },

        parseHash: function () {
            var parts = location.hash.split( '/' ),
                schema = parts[1],
                page = parts[2];
            return {
                schema: schema,
                page: page
            };
        },

        updateHash: function () {
            var newHash = "#/" + this.currentSchemaName + "/" + this.currentPage,
                state = {
                    schema: this.currentSchemaName,
                    page: this.currentPage
                };
            console.log( newHash, location.hash );
            if ( location.hash == newHash ) {
                return;
            }
            else if ( !location.hash ) {
                history.replaceState( state, '', newHash );
            }
            else {
                history.pushState( state, '', newHash );
            }
        },

        saveItem: function (i) {
            var self = this,
                value = this.prepareSaveItem( this.items[i], this.currentOperations['set'].schema ),
                url = Yancy.fillTemplate( this.currentOperations['set'].url, this.openedOldValue );
            delete this.error.saveItem;
            this.$set( this, 'formError', {} );
            $.ajax(
                {
                    url: url,
                    method: 'PUT',
                    data: value,
                    dataType: "json",
                    contentType: "application/json"
                }
            ).done(
                function ( data, status, jqXHR ) {
                    self.items[i] = data;
                    self.toggleRow( i );
                    self.addToast( { icon: "fa-save", title: "Saved", text: "Item saved" } );
                }
            ).fail(
                function ( jqXHR, textStatus, errorThrown ) {
                    if ( jqXHR.responseJSON ) {
                        self.parseErrorResponse( jqXHR.responseJSON );
                        self.$set( self.error, 'saveItem', 'Data validation failed' );
                    }
                    else {
                        self.$set( self.error, 'saveItem', jqXHR.responseText );
                    }
                }
            );
        },

        addItem: function () {
            var self = this,
                schema = this.currentSchema,
                value = this.prepareSaveItem( this.newItem, schema ),
                url = this.currentOperations['add'].url;
            delete this.error.addItem;
            this.$set( this, 'formError', {} );
            $.ajax(
                {
                    url: url,
                    method: 'POST',
                    data: value,
                    dataType: "json",
                    contentType: "application/json"
                }
            ).done(
                function ( data, status, jqXHR ) {
                    self.items.unshift( data );
                    self.total++;
                    self.cancelAddItem();
                    self.addToast( { icon: "fa-save", title: "Added", text: "Item added" } );
                }
            ).fail(
                function ( jqXHR, textStatus, errorThrown ) {
                    if ( jqXHR.responseJSON ) {
                        self.parseErrorResponse( jqXHR.responseJSON );
                        self.$set( self.error, 'addItem', 'Data validation failed' );
                    }
                    else {
                        self.$set( self.error, 'addItem', jqXHR.responseText );
                    }
                }
            );
        },

        parseErrorResponse: function ( resp ) {
            for ( var i = 0; i < resp.errors.length; i++ ) {
                var error = resp.errors[ i ],
                    pathParts = error.path.split( /\// ),
                    field = pathParts[2],
                    message = error.message;
                this.$set( this.formError, field, message );
            }
        },

        prepareSaveItem: function ( item, schema ) {
            var copy = JSON.parse( JSON.stringify( item ) );
            for ( var k in schema.properties ) {
                var prop = schema.properties[k];
                if ( prop.readOnly ) {
                    delete copy[k];
                }
                else if (
                    ( prop.type == 'boolean' || prop.type[0] == 'boolean' )
                    && !copy[k]
                ) {
                    copy[k] = false;
                }
                else if ( prop.format == 'markdown' ) {
                    if ( prop['x-html-field'] ) {
                        copy[ prop['x-html-field'] ]
                            = marked( copy[k], { sanitize: false });
                    }
                }
            }
            return JSON.stringify( copy );
        },

        showAddItem: function () {
            if ( this.addingItem ) {
                this.cancelAddItem();
                return;
            }
            this.toggleRow();
            this.newItem = this.createBlankItem();
            this.addingItem = true;
        },

        cancelAddItem: function () {
            this.$set( this, 'formError', {} );
            this.addingItem = false;
            this.newItem = this.createBlankItem();
        },

        createBlankItem: function () {
            var schema = this.currentSchema,
                item = {};
            for ( var k in schema.properties ) {
                item[k] = schema.properties[k].default === undefined ? null : schema.properties[k].default;
            }
            return item;
        },

        confirmDeleteItem: function (i) {
            this.deleteIndex = i;
            $( '#confirmDelete' ).modal( 'show' );
        },

        cancelDeleteItem: function () {
            this.deleteIndex = null;
            $( '#confirmDelete' ).modal( 'hide' );
        },

        deleteItem: function () {
            var i = this.deleteIndex,
                self = this,
                schema = this.currentSchema,
                value = $( '#data-' + i ).val(),
                url = Yancy.fillTemplate( this.currentOperations['delete'].url, this.items[i] );
            $.ajax(
                {
                    url: url,
                    method: 'DELETE',
                    data: value
                }
            ).done(
                function ( data, status, jqXHR ) {
                    self.cancelDeleteItem();
                    self.items.splice(i,1);
                }
            ).fail(
                function ( jqXHR, status ) {
                    alert( "Failed: " + status );
                }
            );

        },

        gotoPage: function ( page ) {
            this.currentPage = page;
            window.scrollTo( 0, 0 );
        },

        renderValue: function ( field, value ) {
            var schema = this.currentSchema;
            if ( !schema.properties[ field ] ) {
                return value;
            }
            var fieldType = schema.properties[ field ].type;
            var type = Array.isArray( fieldType ) ? fieldType[0] : fieldType;
            if ( type == 'boolean' ) {
                return value ? 'Yes' : 'No';
            }
            return value;
        },

        rowId: function ( row ) {
            var schema = this.currentSchema,
                idField = schema['x-id-field'] || 'id',
                rowId = row[ idField ];
            return rowId;
        },

        rowViewUrl: function ( data ) {
            return Yancy.fillTemplate( this.currentSchema[ 'x-view-item-url' ], data );
        },

        fillTemplate: function ( tmpl, data ) {
            return tmpl.replace( /\{([^}]+)\}/g, function ( match, field ) {
                if ( !data[field].replace ) {
                    // This must not be a string, so we can't escape it...
                    return data[field];
                }
                // This works the same as Mojo::Util xml_escape
                return data[field].replace( /[&<>"']/g, function ( match ) {
                    switch ( match ) {
                        case '&': return '&amp;';
                        case '<': return '&lt;';
                        case '>': return '&gt;';
                        case '"': return '&quot;';
                        case "'": return '&#039;';
                    }
                } );
            } );
        },

        addToast: function ( toast ) {
            var self = this;
            this.toasts.push( toast );
            setTimeout(
                function ( toast ) { self.removeToast( null, toast ) },
                5000,
                toast
            );
        },

        removeToast: function ( event, toast ) {
            var target = event ? $( event.target ).closest( '.toast' ) : $( '.toast-container .toast' ).first(),
                self = this;
            target.on( 'hidden.bs.toast', function () {
                self.toasts.splice( self.toasts.indexOf( toast ), 1 );
            } );
            target.toast( 'hide' );
        }

    },
    computed: {
        totalPages: function () {
            var mod = this.total % this.perPage,
                pages = this.total / this.perPage,
                totalPages = mod == 0 ? pages : Math.floor( pages ) + 1;
            return totalPages;
        },

        pagerPages: function () {
            var totalPages = this.totalPages,
                currentPage = this.currentPage,
                pages = [];
            if ( totalPages < 10 ) {
                for ( var i = 1; i <= totalPages; i++ ) {
                    pages.push( i );
                }
                return pages;
            }
            var minPage = currentPage > 4 ? currentPage - 4 : 1,
                maxPage = minPage + 8 < totalPages ? minPage + 8 : totalPages;
            for ( var i = minPage; i <= maxPage; i++ ) {
                pages.push( i );
            }
            return pages;
        },

        currentOperations: function () {
            return this.schema[ this.currentSchemaName ] ? this.schema[ this.currentSchemaName ].operations : {};
        },
        currentSchema: function () {
            return this.currentOperations.get ? this.currentOperations.get.schema : {};
        }
    },
    watch: {
        currentSchemaName: function () {
            this.data = [];
            this.currentPage = 1;
            this.openedRow = null;
            this.addingItem = false;
            this.fetching = false;
            this.sortColumn = null;
            this.sortDirection = 1;
            this.filters = [];
            this.fetchPage();
        },
        currentPage: function () {
            this.fetchPage();
        }
    },
    mounted: function () {
        this.fetchSpec();
    }
});


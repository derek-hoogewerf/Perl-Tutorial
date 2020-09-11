package Yancy::Plugin::Form;
our $VERSION = '1.066';
# ABSTRACT: Generate form HTML using various UI libraries

#pod =head1 SYNOPSIS
#pod
#pod     use Mojolicious::Lite;
#pod     plugin Yancy => {
#pod         backend => 'pg://localhost/mysite',
#pod         read_schema => 1,
#pod     };
#pod     app->yancy->plugin( 'Form::Bootstrap4' );
#pod     app->routes->get( '/people/:id/edit' )->to(
#pod         'yancy#set',
#pod         schema => 'people',
#pod         template => 'edit_people',
#pod     );
#pod     app->start;
#pod     __DATA__
#pod     @@ edit_people.html.ep
#pod     %= $c->yancy->form->form_for( 'people' );
#pod
#pod =head1 DESCRIPTION
#pod
#pod The Form plugins generate forms from JSON schemas. Plugin and
#pod application developers can use the form plugin API to make forms, and
#pod then sites can load a specific form library plugin to match the style of
#pod the site.
#pod
#pod B<NOTE:> This API is B<EXPERIMENTAL> and will be considered stable in
#pod Yancy version 2.0. Please report any issues you have or features you'd
#pod like to see. Minor things may change before version 2.0, so be sure to
#pod read the release changelog before upgrading.
#pod
#pod =head2 Available Libraries
#pod
#pod =over
#pod
#pod =item * L<Yancy::Plugin::Form::Bootstrap4> - Forms using L<Bootstrap 4|http://getbootstrap.com/docs/4.0/>
#pod
#pod =back
#pod
#pod =head1 HELPERS
#pod
#pod All form plugins add the same helpers with the same arguments so that
#pod applications can use the form plugin that matches their site's
#pod appearance. Yancy plugin and app developers should use form plugins to
#pod build forms so that users can easily customize the form's appearance.
#pod
#pod =head2 yancy->form->input
#pod
#pod     my $html = $c->yancy->form->input( %args );
#pod     %= $c->yancy->form->plugin( %args );
#pod
#pod Create a form input. Usually one of a C<< <input> >>, C<< <textarea >>,
#pod or C<< <select> >> element, but can be more.
#pod
#pod C<%args> is a list of name/value pairs with the following keys:
#pod
#pod =over
#pod
#pod =item type
#pod
#pod The type of the input field to create. One of the JSON schema types.
#pod See L<Yancy::Help::Config/Data Collections> for details on the supported
#pod types.
#pod
#pod =item name
#pod
#pod The name of the input. Required.
#pod
#pod =item value
#pod
#pod The value to show in the input. If not defined, will take the value from
#pod the current request parameters.
#pod
#pod =item format
#pod
#pod For C<string> types, the format the string should take. One of the
#pod supported JSON schema formats, along with some additional ones. See
#pod L<Yancy::Help::Config/Generated Forms> for details on the supported
#pod formats.
#pod
#pod =item pattern
#pod
#pod A regex pattern to validate the field before submit.
#pod
#pod =item required
#pod
#pod If true, the field will be marked as required.
#pod
#pod =item readonly
#pod
#pod If true, the field will be marked as read-only.
#pod
#pod =item disabled
#pod
#pod If true, the field will be marked as disabled.
#pod
#pod =item placeholder
#pod
#pod The placeholder for C<< <input> >> and C<< <textarea> >> elements.
#pod
#pod =item id
#pod
#pod The ID for this field.
#pod
#pod =item class
#pod
#pod A string with additional classes to add to this field.
#pod
#pod =item minlength
#pod
#pod The minimum length of the text in this field. Used to validate the form.
#pod
#pod =item maxlength
#pod
#pod The maximum length of the text in this field. Used to validate the form.
#pod
#pod =item minimum
#pod
#pod The minimum value for the number in this field. Used to validate the
#pod form.
#pod
#pod =item maximum
#pod
#pod The maximum value for the number in this field. Used to validate the
#pod form.
#pod
#pod =back
#pod
#pod Most of these properties are the same as the JSON schema field
#pod properties. See L<Yancy::Help::Config/Generated Forms> for details on
#pod how Yancy translates JSON schema into forms.
#pod
#pod =head2 yancy->form->input_for
#pod
#pod     my $html = $c->yancy->form->input_for( $schema, $property, %args );
#pod     %= $c->yancy->form->input_for( $schema, $property, %args );
#pod
#pod Create a form input for the given schema's property. This creates just
#pod the input field, nothing else. To add a label, see C<field_for>.
#pod
#pod C<%args> is a list of name/value pairs with the following keys:
#pod
#pod =over
#pod
#pod =item type
#pod
#pod =item value
#pod
#pod =item required
#pod
#pod =item format
#pod
#pod =item enum
#pod
#pod =item enum_labels
#pod
#pod =item class
#pod
#pod =back
#pod
#pod =head2 yancy->form->filter_for
#pod
#pod     my $html = $c->yancy->form->filter_for( $schema, $property, %args );
#pod     %= $c->yancy->form->filter_for( $schema, $property, %args );
#pod
#pod Create a form input suitable as a filter for the given schema's
#pod property. A filter input is never a required field, and always allows
#pod some kind of "blank" value. The filter automatically captures a value
#pod from the query parameter of the same name as the C<$property>. This
#pod creates just the input field, nothing else.
#pod
#pod Takes the same C<%args> as L</input_for>, with the following changes:
#pod
#pod =over
#pod
#pod =item * required is always false
#pod
#pod =item * format is always removed, to allow for partial searches
#pod
#pod =item * 'boolean' type fields become enum fields with 'yes', 'no', and
#pod empty (either) options
#pod
#pod =back
#pod
#pod =head2 yancy->form->field_for
#pod
#pod     my $html = $c->yancy->form->field_for( $schema, $name, %args );
#pod     %= $c->yancy->form->field_for( $schema, $name, %args );
#pod
#pod Generate a field for the given C<$schema> and property C<$name>. The
#pod field will include a C<< <label> >>, the appropriate input (C<< <input>
#pod >>, C<< <select> >>, or otherwise ), and any descriptive text. C<%args>
#pod is a hash with the following keys:
#pod
#pod =over
#pod
#pod =item title
#pod
#pod The field's title. Defaults to the C<title> defined for this property
#pod in the schema (see L<Yancy::Help::Config>), or the field's name.
#pod
#pod =item description
#pod
#pod The field's description. Optional. Defaults to the C<description> defined
#pod for this property in the schema (see L<Yancy::Help::Config>).
#pod
#pod =item class
#pod
#pod A class to apply to the input element. See L</input>.
#pod
#pod =back
#pod
#pod =head2 yancy->form->form_for
#pod
#pod     my $html = $c->yancy->form->form_for( $schema, %args );
#pod     %= $c->yancy->form->plugin( $schema, %args );
#pod
#pod Generate a form to edit an item from the given C<$schema>. The form
#pod will include all the fields, a CSRF token, and a single button to submit
#pod the form.
#pod
#pod B<NOTE>: For CSRF tokens to work, this must be called with the current
#pod controller, not with C<app>. To disable CSRF (not recommended), pass C<<
#pod csrf => 0 >> in C<%args>.
#pod
#pod C<%args> is a list of name/value pairs with the following keys:
#pod
#pod =over
#pod
#pod =item method
#pod
#pod The C<method> attribute for the C<< <form> >> tag. Defaults to C<POST>.
#pod
#pod =item action
#pod
#pod The C<action> URL for the C<< <form> >> tag.
#pod
#pod =item item
#pod
#pod A hashref of values to fill in the form. Defaults to the value of the
#pod C<item> in the stash (which is set by L<Yancy::Controller::Yancy/set>.)
#pod
#pod =item properties
#pod
#pod Arrayref of fields to show in this form. Defaults to the C<properties>
#pod stash value (like the L<set action in Yancy::Controller::Yancy|Yancy::Controller::Yancy/set> uses).
#pod Otherwise, defaults to showing all fields except read-only fields.
#pod
#pod =back
#pod
#pod =head1 SEE ALSO
#pod
#pod L<Yancy>
#pod
#pod =cut

use Mojo::Base 'Mojolicious::Plugin';
use Yancy::Util qw( currym );

sub register {
    my ( $self, $app, $conf ) = @_;
    my $prefix = $conf->{prefix} || 'form';
    
    $app->plugin( 'Mojolicious::Plugin::I18N' );
    
    for my $method ( qw( form_for field_for input_for filter_for input ) ) {
        $app->helper( "yancy.$prefix.$method" => currym( $self, $method ) );
    }
}

1;

__END__

=pod

=head1 NAME

Yancy::Plugin::Form - Generate form HTML using various UI libraries

=head1 VERSION

version 1.066

=head1 SYNOPSIS

    use Mojolicious::Lite;
    plugin Yancy => {
        backend => 'pg://localhost/mysite',
        read_schema => 1,
    };
    app->yancy->plugin( 'Form::Bootstrap4' );
    app->routes->get( '/people/:id/edit' )->to(
        'yancy#set',
        schema => 'people',
        template => 'edit_people',
    );
    app->start;
    __DATA__
    @@ edit_people.html.ep
    %= $c->yancy->form->form_for( 'people' );

=head1 DESCRIPTION

The Form plugins generate forms from JSON schemas. Plugin and
application developers can use the form plugin API to make forms, and
then sites can load a specific form library plugin to match the style of
the site.

B<NOTE:> This API is B<EXPERIMENTAL> and will be considered stable in
Yancy version 2.0. Please report any issues you have or features you'd
like to see. Minor things may change before version 2.0, so be sure to
read the release changelog before upgrading.

=head2 Available Libraries

=over

=item * L<Yancy::Plugin::Form::Bootstrap4> - Forms using L<Bootstrap 4|http://getbootstrap.com/docs/4.0/>

=back

=head1 HELPERS

All form plugins add the same helpers with the same arguments so that
applications can use the form plugin that matches their site's
appearance. Yancy plugin and app developers should use form plugins to
build forms so that users can easily customize the form's appearance.

=head2 yancy->form->input

    my $html = $c->yancy->form->input( %args );
    %= $c->yancy->form->plugin( %args );

Create a form input. Usually one of a C<< <input> >>, C<< <textarea >>,
or C<< <select> >> element, but can be more.

C<%args> is a list of name/value pairs with the following keys:

=over

=item type

The type of the input field to create. One of the JSON schema types.
See L<Yancy::Help::Config/Data Collections> for details on the supported
types.

=item name

The name of the input. Required.

=item value

The value to show in the input. If not defined, will take the value from
the current request parameters.

=item format

For C<string> types, the format the string should take. One of the
supported JSON schema formats, along with some additional ones. See
L<Yancy::Help::Config/Generated Forms> for details on the supported
formats.

=item pattern

A regex pattern to validate the field before submit.

=item required

If true, the field will be marked as required.

=item readonly

If true, the field will be marked as read-only.

=item disabled

If true, the field will be marked as disabled.

=item placeholder

The placeholder for C<< <input> >> and C<< <textarea> >> elements.

=item id

The ID for this field.

=item class

A string with additional classes to add to this field.

=item minlength

The minimum length of the text in this field. Used to validate the form.

=item maxlength

The maximum length of the text in this field. Used to validate the form.

=item minimum

The minimum value for the number in this field. Used to validate the
form.

=item maximum

The maximum value for the number in this field. Used to validate the
form.

=back

Most of these properties are the same as the JSON schema field
properties. See L<Yancy::Help::Config/Generated Forms> for details on
how Yancy translates JSON schema into forms.

=head2 yancy->form->input_for

    my $html = $c->yancy->form->input_for( $schema, $property, %args );
    %= $c->yancy->form->input_for( $schema, $property, %args );

Create a form input for the given schema's property. This creates just
the input field, nothing else. To add a label, see C<field_for>.

C<%args> is a list of name/value pairs with the following keys:

=over

=item type

=item value

=item required

=item format

=item enum

=item enum_labels

=item class

=back

=head2 yancy->form->filter_for

    my $html = $c->yancy->form->filter_for( $schema, $property, %args );
    %= $c->yancy->form->filter_for( $schema, $property, %args );

Create a form input suitable as a filter for the given schema's
property. A filter input is never a required field, and always allows
some kind of "blank" value. The filter automatically captures a value
from the query parameter of the same name as the C<$property>. This
creates just the input field, nothing else.

Takes the same C<%args> as L</input_for>, with the following changes:

=over

=item * required is always false

=item * format is always removed, to allow for partial searches

=item * 'boolean' type fields become enum fields with 'yes', 'no', and
empty (either) options

=back

=head2 yancy->form->field_for

    my $html = $c->yancy->form->field_for( $schema, $name, %args );
    %= $c->yancy->form->field_for( $schema, $name, %args );

Generate a field for the given C<$schema> and property C<$name>. The
field will include a C<< <label> >>, the appropriate input (C<< <input>
>>, C<< <select> >>, or otherwise ), and any descriptive text. C<%args>
is a hash with the following keys:

=over

=item title

The field's title. Defaults to the C<title> defined for this property
in the schema (see L<Yancy::Help::Config>), or the field's name.

=item description

The field's description. Optional. Defaults to the C<description> defined
for this property in the schema (see L<Yancy::Help::Config>).

=item class

A class to apply to the input element. See L</input>.

=back

=head2 yancy->form->form_for

    my $html = $c->yancy->form->form_for( $schema, %args );
    %= $c->yancy->form->plugin( $schema, %args );

Generate a form to edit an item from the given C<$schema>. The form
will include all the fields, a CSRF token, and a single button to submit
the form.

B<NOTE>: For CSRF tokens to work, this must be called with the current
controller, not with C<app>. To disable CSRF (not recommended), pass C<<
csrf => 0 >> in C<%args>.

C<%args> is a list of name/value pairs with the following keys:

=over

=item method

The C<method> attribute for the C<< <form> >> tag. Defaults to C<POST>.

=item action

The C<action> URL for the C<< <form> >> tag.

=item item

A hashref of values to fill in the form. Defaults to the value of the
C<item> in the stash (which is set by L<Yancy::Controller::Yancy/set>.)

=item properties

Arrayref of fields to show in this form. Defaults to the C<properties>
stash value (like the L<set action in Yancy::Controller::Yancy|Yancy::Controller::Yancy/set> uses).
Otherwise, defaults to showing all fields except read-only fields.

=back

=head1 SEE ALSO

L<Yancy>

=head1 AUTHOR

Doug Bell <preaction@cpan.org>

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2020 by Doug Bell.

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut

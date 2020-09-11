@rem = '--*-Perl-*--
@set "ErrorLevel="
@if "%OS%" == "Windows_NT" @goto WinNT
@perl -x -S "%0" %1 %2 %3 %4 %5 %6 %7 %8 %9
@set ErrorLevel=%ErrorLevel%
@goto endofperl
:WinNT
@perl -x -S %0 %*
@set ErrorLevel=%ErrorLevel%
@if NOT "%COMSPEC%" == "%SystemRoot%\system32\cmd.exe" @goto endofperl
@if %ErrorLevel% == 9009 @echo You do not have Perl in your PATH.
@goto endofperl
@rem ';
#!/usr/bin/env perl
#line 16
# PODNAME: yancy
# ABSTRACT: Start the standalone Yancy web application

our $VERSION = '1.066';

#pod =head1 SYNOPSIS
#pod
#pod   yancy daemon
#pod   yancy help
#pod
#pod =head1 DESCRIPTION
#pod
#pod This program loads the standalone Yancy web application,
#pod a L<Mojolicious> web application. For more detailed help, see
#pod C<yancy help>.
#pod
#pod =head1 SEE ALSO
#pod
#pod L<Yancy>, L<Mojolicious>
#pod
#pod =cut

use strict;
use warnings;
use File::Spec::Functions qw( catdir updir );
use FindBin ();
use lib "$FindBin::Bin/../lib";

require Mojolicious::Commands;
Mojolicious::Commands->start_app( 'Yancy' );

__END__

=pod

=head1 NAME

yancy - Start the standalone Yancy web application

=head1 VERSION

version 1.066

=head1 SYNOPSIS

  yancy daemon
  yancy help

=head1 DESCRIPTION

This program loads the standalone Yancy web application,
a L<Mojolicious> web application. For more detailed help, see
C<yancy help>.

=head1 SEE ALSO

L<Yancy>, L<Mojolicious>

=head1 AUTHOR

Doug Bell <preaction@cpan.org>

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2020 by Doug Bell.

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut
__END__
:endofperl
@set "ErrorLevel=" & @goto _undefined_label_ 2>NUL || @"%COMSPEC%" /d/c @exit %ErrorLevel%

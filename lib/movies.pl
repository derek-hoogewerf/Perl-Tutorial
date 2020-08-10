#!/usr/bin/perl
use warnings;
use diagnostics;
use strict;

my $filename = 'F:\Movie_Prog\a_short\list.txt';
open(FH, '<', $filename) or die "Couldn't open file";
my $entry;
while(<FH>)
{
    $entry = <FH>;
    $entry =~ s/dd-mm-yyyy hh:mm\s[0-9]{2}:[0-9]{2}\s(1| )(,| )[0-9]{3}//g;
    $entry =~ s/\s\- Shortcut.lnk//g;
    $entry =~ s/\.?\d{4}?\./\$2(\)/g;
}
close(FH) || die "Couldn't close file properly";
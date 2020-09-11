#!/usr/bin/perl
use warnings;
use diagnostics;
use strict;

my $filename = 'C:\Users\LENOVO\Documents\Movlist.txt';
open(FH, '<', $filename) or die "Couldn't open file";
my $entry;
my $output = 'C:\Users\LENOVO\Documents\load.txt';
open(OP, '>', $output) or die $!;
while(<FH>)
{
    $entry = <FH>;
    $entry =~ s/[0-9]{2}\/[0-9]{2}\/[0-9]{4}\s*[0-9]{2}:[0-9]{2}\s*(PM|AM)\s*( |1)(,| )[0-9]{3}//g;
    $entry =~ s/(\.)([0-9]{4})(\.)/\($2\)/g;
    $entry =~ s/\s\- Shortcut.lnk//g;
    
    #$entry =~ s/(.*?\([1900-2020]\))(\.(mkv|ts|mp4|avi|flv|wmv))/$1$2/g;
    $entry =~ s/(.*\([0-9]{4}\)).*(\.(mkv|ts|mp4|avi|flv|wmv))$/$1$2/g;
    print OP $entry;
    #print "$entry";
}
close(OP);
close(FH) || die "Couldn't close file properly";
print "Writing to file successfully!\n";
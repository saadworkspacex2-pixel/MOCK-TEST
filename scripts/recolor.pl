#!/usr/bin/env perl
use strict;
use warnings;

# Dark theme -> LHBD light theme class mapping (single pass, longest-first)
my %map = (
  # gradients / compound
  'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent' => 'text-[#E51A24]',
  'bg-gradient-to-r from-emerald-500 to-cyan-500' => 'btn-red',
  'bg-gradient-to-br from-emerald-400 to-cyan-500' => 'bg-[#E51A24]',
  'bg-gradient-to-r from-emerald-500/15 to-cyan-500/10' => 'bg-[#E51A24]/[0.08]',
  'bg-gradient-to-b from-slate-900 to-slate-950' => 'card',
  'bg-gradient-to-b from-slate-900 to-slate-900/60' => 'card',
  'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' => 'bg-[#F8F9FA]',
  'from-emerald-500/20 to-emerald-500/5' => 'from-red-50 to-white',
  'from-cyan-500/20 to-cyan-500/5' => 'from-sky-50 to-white',
  'from-indigo-500/20 to-indigo-500/5' => 'from-indigo-50 to-white',
  'from-amber-500/20 to-amber-500/5' => 'from-amber-50 to-white',
  'from-rose-500/20 to-rose-500/5' => 'from-rose-50 to-white',
  'from-teal-500/20 to-teal-500/5' => 'from-teal-50 to-white',
  # shadows
  'shadow-emerald-500/25' => 'shadow-red-200',
  'shadow-emerald-500/40' => 'shadow-red-200',
  'shadow-emerald-500/20' => 'shadow-red-100',
  'shadow-emerald-500/5' => 'shadow-slate-200/60',
  'shadow-emerald-500/10' => 'shadow-slate-200/60',
  'shadow-cyan-500/30' => 'shadow-slate-300',
  'shadow-amber-500/20' => 'shadow-amber-200',
  'shadow-black/40' => 'shadow-slate-300/60',
  'shadow-black/20' => 'shadow-slate-200/60',
  # emerald accents -> brand red
  'border-emerald-500/30' => 'border-red-200',
  'border-emerald-500/40' => 'border-red-300',
  'border-emerald-500/50' => 'border-red-300',
  'border-emerald-500/60' => 'border-red-300',
  'border-emerald-500' => 'border-[#E51A24]',
  'ring-emerald-500/30' => 'ring-red-200',
  'ring-emerald-500/50' => 'ring-red-300',
  'ring-emerald-500/20' => 'ring-red-100',
  'bg-emerald-500/[0.04]' => 'bg-red-50/50',
  'bg-emerald-500/10' => 'bg-red-50',
  'bg-emerald-500/15' => 'bg-red-50',
  'bg-emerald-500/20' => 'bg-red-100',
  'bg-emerald-500/25' => 'bg-red-100',
  'bg-emerald-500' => 'bg-[#E51A24]',
  'bg-emerald-400' => 'bg-[#E51A24]',
  'border-t-emerald-400' => 'border-t-[#E51A24]',
  'text-emerald-400' => 'text-[#E51A24]',
  'text-emerald-300' => 'text-[#E51A24]',
  'text-emerald-200' => 'text-emerald-700',
  'text-emerald-600' => 'text-emerald-700',
  'text-emerald-50' => 'text-red-50',
  # cyan -> neutral
  'bg-cyan-500/10' => 'bg-slate-100',
  'bg-cyan-500/15' => 'bg-slate-100',
  'bg-cyan-500' => 'bg-[#1A1A1A]',
  'text-cyan-300' => 'text-slate-600',
  'text-cyan-400' => 'text-slate-600',
  # dark overlays kept dark
  'bg-slate-950/80' => 'bg-slate-900/40',
  'bg-slate-950/70' => 'bg-slate-900/40',
  'bg-slate-950/60' => 'bg-slate-900/40',
  'bg-slate-950/90' => 'glass',
  'bg-slate-950/95' => 'glass',
  'bg-slate-950/85' => 'glass',
  'bg-slate-950/50' => 'bg-white',
  'bg-slate-950' => 'bg-[#F8F9FA]',
  # dark surfaces -> white cards
  'bg-slate-900/95' => 'glass',
  'bg-slate-900/90' => 'glass',
  'bg-slate-900/80' => 'glass',
  'bg-slate-900/70' => 'card',
  'bg-slate-900/60' => 'card',
  'bg-slate-900/40' => 'bg-white',
  'bg-slate-900/30' => 'bg-white',
  'bg-slate-900' => 'bg-white',
  'bg-slate-800/50' => 'bg-slate-100',
  'bg-slate-800/60' => 'bg-slate-100',
  'bg-slate-800/70' => 'bg-slate-100',
  'bg-slate-800/40' => 'bg-slate-50',
  'bg-slate-800' => 'bg-slate-100',
  'bg-slate-700/50' => 'bg-slate-200',
  'bg-slate-700' => 'bg-slate-200',
  'bg-slate-400/20' => 'bg-slate-200',
  # borders
  'border-slate-800/70' => 'border-slate-200',
  'border-slate-800/80' => 'border-slate-200',
  'border-slate-800' => 'border-black/[0.07]',
  'border-slate-700' => 'border-slate-300',
  'divide-slate-800/70' => 'divide-slate-100',
  # text
  'text-slate-950' => 'text-white',
  'text-slate-100' => 'text-slate-900',
  'text-slate-200' => 'text-slate-800',
  'text-slate-300' => 'text-slate-700',
  'text-slate-400' => 'text-[#6C757D]',
  'hover:text-white' => 'hover:text-slate-900',
  # rose / amber / indigo / orange for light bg
  'text-rose-300' => 'text-rose-600',
  'text-rose-400' => 'text-rose-600',
  'text-rose-200' => 'text-rose-700',
  'bg-rose-500/10' => 'bg-rose-50',
  'bg-rose-500/15' => 'bg-rose-50',
  'bg-rose-500/20' => 'bg-rose-100',
  'bg-rose-500/[0.04]' => 'bg-rose-50/60',
  'border-rose-500/30' => 'border-rose-200',
  'border-rose-500/50' => 'border-rose-300',
  'border-rose-500' => 'border-rose-400',
  'text-amber-300' => 'text-amber-600',
  'bg-amber-500/15' => 'bg-amber-50',
  'bg-amber-500/10' => 'bg-amber-50',
  'bg-amber-400/20' => 'bg-amber-100',
  'border-amber-500/30' => 'border-amber-200',
  'bg-indigo-500/10' => 'bg-indigo-50',
  'text-indigo-300' => 'text-indigo-600',
  'text-orange-300' => 'text-orange-600',
  'bg-orange-400/20' => 'bg-orange-100',
);

my $alt = join '|', map { quotemeta } sort { length($b) <=> length($a) } keys %map;
my $re = qr/($alt)/;

local $/;
for my $file (@ARGV) {
  open my $in, '<', $file or die "$file: $!";
  my $content = <$in>;
  close $in;
  $content =~ s/$re/$map{$1}/g;
  open my $out, '>', $file or die "$file: $!";
  print $out $content;
  close $out;
}

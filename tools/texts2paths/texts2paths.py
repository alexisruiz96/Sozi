#!/usr/bin/python2

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from optparse import OptionParser
from lxml import etree
import subprocess, shutil, sys, os

if __name__ == '__main__':
    option_parser = OptionParser()

    option_parser.description = "Convert all texts to paths"
    option_parser.usage = "texts2paths.py [options] input_file.svg"

    option_parser.add_option("-o", "--output", type="string", dest="output",
        help="The target SVG file name")

    options, args = option_parser.parse_args()

    if len(args) == 0:
        option_parser.print_usage(sys.stderr)
        sys.exit()

    # Set input and output file name
    input_file_name = args[0]

    if options.output is not None:
        output_file_name = options.output
    else:
        output_file_name = os.path.basename(input_file_name)
        output_file_name = os.path.splitext(output_file_name)[0] + "-texts2paths.svg"

    shutil.copy(input_file_name, output_file_name)

    # Get text elements from the original document
    input_file = open(input_file_name)
    tree = etree.parse(input_file)
    texts = tree.getroot().xpath("//*[local-name() = $name]", name="text")
    input_file.close()

    # Use Inkscape to convert each text element to a path
    command = ["inkscape"]
    for t in texts:
        command += ["--verb=EditDeselect", "--select=" + t.get("id"), "--verb=ObjectToPath"]
    command += ["--verb=FileSave", "--verb=FileClose", output_file_name]

    subprocess.call(command)

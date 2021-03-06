<?php
namespace Slimpd\Models;
/* Copyright (C) 2015-2016 othmar52 <othmar52@users.noreply.github.com>
 *
 * This file is part of sliMpd - a php based mpd web client
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
class File extends \Slimpd\Models\AbstractFilesystemItem {
    protected $exists = FALSE;
    protected $ext = '';
    public function __construct($relPath) {
        try {
            $this->relPath = $relPath;
            $this->title = basename($relPath);
            // TODO: move ext to string functions
            $this->ext = strtolower(preg_replace('/^.*\./', '', $relPath));
            $this->relPathHash = getFilePathHash($relPath);
        } catch (Exception $e) {}
    }

    public function validate() {
        $realPath = getFileRealPath($this->getRelPath());
        if(isInAllowedPath($this->relPath) === FALSE || $realPath === FALSE) {
            return FALSE;
        }

        // check if it is really a file because getFileRealPath() also works for directories
        if(is_file($realPath) === FALSE) {
            return FALSE;
        }
        $this->setExists(TRUE);
        return TRUE;
    }

    public function getExists() {
        return $this->exists;
    }

    public function setExists($value) {
        $this->exists = $value;
        return $this;
    }

    public function getBreadcrumb() {
        return $this->breadcrumb;
    }

    public function setBreadcrumb($value) {
        $this->breadcrumb = $value;
        return $this;
    }

    public function getExt() {
        return $this->ext;
    }

    public function setExt($value) {
        $this->ext = $value;
        return $this;
    }
}

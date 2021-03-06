<?php
namespace Slimpd\Middleware;
/* Copyright (C) 2017 othmar52 <othmar52@users.noreply.github.com>
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

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class ValidationErrorsMiddleware extends Middleware
{
    protected $container;

    public function __invoke(Request $request, Response $response, $next)
    {
        if($this->container->session->get('errors')) {
            $this->container->view->getEnvironment()->addGlobal(
                'errors',
                $this->container->session->get('errors')
            );
            $this->container->session->delete('errors');
        }
        $response = $next($request, $response);
        return $response;
    }
}

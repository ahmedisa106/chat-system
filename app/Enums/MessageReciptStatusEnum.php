<?php

namespace App\Enums;

enum MessageReciptStatusEnum: int
{
    case PENDING = 1;
    case DELIVERED = 2;
    case READ = 3;
}

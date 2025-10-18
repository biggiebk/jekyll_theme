---
layout: default
title: Home
---

# Welcome

This is a minimal dark Jekyll theme with syntax highlighted code blocks.

## Example: JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('world');
```

## Example: Python

```python
def add(a, b):
    return a + b

print(add(2,3))
```

## Terraform (HCL) example:

```hcl
terraform {
	required_version = ">= 1.0"
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = "~> 4.0"
		}
	}
}

provider "aws" {
	region = "us-east-1"
}

resource "aws_s3_bucket" "example" {
	bucket = "my-example-bucket"
	acl    = "private"
}
```

## KQL (Kusto Query Language) example:

```kql
// Return the last 24 hours of logs with severity Error
Logs
| where TimeGenerated >= ago(24h)
| where Severity == "Error"
| summarize count() by bin(TimeGenerated, 1h), CloudRoleName
| order by TimeGenerated desc
```